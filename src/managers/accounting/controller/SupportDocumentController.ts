import { NextFunction, Request, Response } from "express";
import * as moment from "moment";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { responseError } from "../../../errors/responseError";
import { appConfig } from "../../../../config";
import { SupportDocument } from "../../../entity/SupportDocument";
import { Element } from "../../../entity/Element";
import { FiscalYear } from "../../../entity/FiscalYear";
import { ProfileActivity } from "../../../entity/ProfileActivity";
import { Voucher } from "../../../entity/Voucher";
import { VoucherDetail } from "../../../entity/VoucherDetail";
import { Account } from "../../../entity/Account";
import { Dj08SectionData, SectionName } from "../../../entity/Dj08SectionData";
import { CreateSupportDocumentDTO } from "../dto/request/createSupportDocument.dto";
import { CreatedSupportDocumentDTO } from "../dto/response/createdSupportDocument.dto";
import { UpdateSupportDocumentDTO } from "../dto/request/updateSupportDocument.dto";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { calculeF20ToDj08 } from "../../../reports/utils/utilsToReports";
import { SetInitialBalanceDTO } from "../dto/request/setInitialBalance.dto";
import { InitialBalancesDTO } from "../dto/request/getInitialBalances.dto";
import { updateMayors, verifyCuadreInAccount } from "../utils";
import {
  AllDataSectionsDj08Type,
  DataSectionAType,
  DataSectionBType,
  DataSectionGType,
  ObjectSectionGType,
  TotalSectionAType,
  TotalSectionGType,
} from "../../../utils/definitions";
import {
  ELEMENT_RELATIONS,
  ELEMENT_SELECT,
} from "../utils/query/element.fetch";
import {
  getSupportDocumentToRemove,
  getSupportDocumentToUpdate,
} from "../utils/query/supportDocument.fetch";
import { getProfileActivities } from "../utils/query/profileActivities.fetch";
import {
  VOUCHER_DETAIL_RELATIONS,
  VOUCHER_DETAIL_SELECT,
} from "../utils/query/voucherDetail.fetch";
import {
  getAccountInitialsBalances,
  getInitialsBalances,
} from "../utils/query/initialBalance.fetch";
import { getLastMayorOfTheAccounts } from "../utils/query/mayorsTheAccountInToFiscalYear.fetch";
import { getInitialBalances } from "../../period/utils";
import { getDJ08SectionsData } from "../utils/query/dj08SectionData.fetch";
import { getParseDJ08SectionsData, setDataSectionG } from "../utils/updateDJ08";
import { getDocumentsFiscalYearOrOfTheProfileActivity } from "../utils/query/allDocumentsOfFiscalYear.fetch";

export class SupportDocumentController extends EntityControllerBase<SupportDocument> {
  private balanced: boolean;
  constructor() {
    const repository = AppDataSource.getRepository(SupportDocument);
    super(repository);
    this.setBalanced();
  }

  async createSupportDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: CreateSupportDocumentDTO = req.body;
      const { element, fiscalYear, profileActivity } = fields;

      if (!element?.id)
        responseError(res, "Do must provide a valid expense element id.", 404);
      if (!fiscalYear?.id)
        responseError(res, "Do must provide a valid fiscal yearId id.", 404);

      const [foundElement, foundFiscalYear] = await Promise.all([
        Element.findOne({
          select: ELEMENT_SELECT,
          relations: ELEMENT_RELATIONS,
          where: { id: element.id },
        }),
        FiscalYear.findOneBy({ id: fiscalYear.id }),
      ]);

      if (!foundElement) responseError(res, "Expense element not found.", 404);
      if (!foundFiscalYear) responseError(res, "Fiscal year not found.", 404);

      let foundProfileActivity: ProfileActivity;
      if (profileActivity?.id) {
        foundProfileActivity = await ProfileActivity.findOneBy({
          id: profileActivity.id,
        });
        if (!foundProfileActivity)
          responseError(res, "Profile activity not found.", 404);
      }

      const objectSupportDocument = Object.assign(new SupportDocument(), {
        ...fields,
        element: foundElement,
        fiscalYear: foundFiscalYear,
        profileActivity: foundProfileActivity,
      });

      const newSupportDocument = await this.create(objectSupportDocument);

      const [cuadreError, updatedDJ08Error] = await Promise.all([
        this.cuadre(newSupportDocument),
        this.updatedDJ08(newSupportDocument),
      ]);

      if (cuadreError || updatedDJ08Error)
        responseError(res, (cuadreError || updatedDJ08Error) as string, 500);

      const supportDocument: CreatedSupportDocumentDTO = newSupportDocument;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { supportDocument },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onSupportDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, req, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateSupportDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: UpdateSupportDocumentDTO = req.body;
      const { id } = req.body;

      if (!id)
        responseError(res, "Update requiere support document id valid.", 404);

      if (!fields.element.account) {
        fields.element.account = await this.getAccountElement(fields.element);

        if (!fields.element.account)
          responseError(res, "It is required Account of the Elemento.", 404);
      }

      const supportDocumentToUpdate = await getSupportDocumentToUpdate(
        id,
        this.repository
      );

      if (!supportDocumentToUpdate)
        responseError(res, `SUPPORTDOCUMENT not found.`, 404);

      const supportDocumentUpdateDTO = this.repository.create({
        ...supportDocumentToUpdate,
        ...fields,
        __oldGroup__: supportDocumentToUpdate.element?.group.trim(),
      });

      const supportDocumentUpdate = await this.repository.save(
        supportDocumentUpdateDTO
      );

      supportDocumentUpdate.fiscalYear = supportDocumentToUpdate.fiscalYear;

      const [cuadreError, updatedDJ08Error] = await Promise.all([
        this.cuadre(supportDocumentUpdate),
        this.updatedDJ08(supportDocumentUpdate),
      ]);

      if (cuadreError || updatedDJ08Error)
        responseError(res, (cuadreError || updatedDJ08Error) as string, 500);

      const supportDocument: CreateSupportDocumentDTO = supportDocumentUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { supportDocument },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteSupportDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id)
        responseError(
          res,
          "Delete support document requiere one id valid.",
          404
        );

      const supportDocumentToRemove = await getSupportDocumentToRemove(
        id,
        this.repository
      );

      if (!supportDocumentToRemove)
        responseError(res, "Entity SUPPORTDOCUMENT not found.", 404);

      const removeSupportDocument = await this.repository.remove(
        supportDocumentToRemove
      );

      const [, , updatedDJ08Error] = await Promise.all([
        updateMayors({
          id: -1,
          date: null,
          fiscalYear: removeSupportDocument.fiscalYear,
          voucherDetail: removeSupportDocument?.voucher?.voucherDetails[0],
        }),
        updateMayors({
          id: -1,
          date: null,
          fiscalYear: removeSupportDocument.fiscalYear,
          voucherDetail: removeSupportDocument?.voucher?.voucherDetails[1],
        }),
        this.updatedDJ08(removeSupportDocument),
      ]);

      const balances = await getLastMayorOfTheAccounts(
        supportDocumentToRemove.fiscalYear.id
      );
      this.balanced = verifyCuadreInAccount(balances);

      if (this.balanced !== removeSupportDocument.fiscalYear.balanced) {
        removeSupportDocument.fiscalYear.balanced = this.balanced;
        removeSupportDocument.fiscalYear.save();
      }

      if (updatedDJ08Error) responseError(res, updatedDJ08Error, 500);

      res.status(204);
      return "Support document has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async getInitialBalancesAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { fiscalYear }: InitialBalancesDTO = req.body;

      if (!fiscalYear?.id)
        responseError(res, "Get initial balances requiere an id valid.", 404);

      const [codeAccountInitials, acountInitials] =
        await getAccountInitialsBalances();
      const mayors = await getInitialsBalances(
        fiscalYear.id,
        codeAccountInitials
      );

      return getInitialBalances(acountInitials, mayors, fiscalYear);
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async setInitialBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: SetInitialBalanceDTO = req.body;
      const accountId = fields.account.id;
      const fiscalYearId = fields.fiscalYear.id;

      if (!accountId)
        responseError(
          res,
          "Update initial balance requiere account id valid.",
          404
        );

      if (!fiscalYearId)
        responseError(
          res,
          "Update initial balance requiere fiscal year id valid.",
          404
        );

      const INITIAL_BALANCE_WHERE = {
        mayor: {
          id: fields.id,
          init_saldo: true,
          fiscalYear: { id: fiscalYearId },
          account: { id: accountId },
        },
        account: { id: accountId },
      };
      const voucherDetailToSet = await VoucherDetail.findOne({
        select: VOUCHER_DETAIL_SELECT,
        relations: VOUCHER_DETAIL_RELATIONS,
        where: INITIAL_BALANCE_WHERE,
      });

      const saldo = fields.voucherDetail.debe - fields.voucherDetail.haber;

      if (!fields.voucherDetail.account) {
        fields.voucherDetail.account = fields.account;
      }

      const balanceData = {
        ...(voucherDetailToSet || {}),
        ...fields.voucherDetail,
        mayor: { ...(voucherDetailToSet?.mayor || {}), ...fields, saldo },
      };

      const balanceResult = await VoucherDetail.create(balanceData).save();
      if (!voucherDetailToSet) {
        balanceResult.mayor.voucherDetail.id = balanceResult.id;
        await balanceResult.mayor.save();
      }

      await updateMayors(balanceResult.mayor);
      const balances = await getLastMayorOfTheAccounts(fiscalYearId);
      this.balanced = verifyCuadreInAccount(balances);

      if (this.balanced !== fields.fiscalYear.balanced) {
        fields.fiscalYear.balanced = this.balanced;
        await FiscalYear.save(fields.fiscalYear);
      }

      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { mayor: balanceResult.mayor, balanced: this.balanced },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  /**
   * @AfterInsert
   * @AfterUpdate
   * @AfterRemove
   */
  private async updatedDJ08(
    supportDocument: SupportDocument
  ): Promise<void | string> {
    try {
      const { __fiscalYearId__: fiscalYearId, type_document } = supportDocument;
      const [dj08ToUpdate, documents, profileActivities] =
        await this.getInitializeUpdateDj08Data(fiscalYearId, type_document);
      const sectionsData =
        getParseDJ08SectionsData<AllDataSectionsDj08Type>(dj08ToUpdate);

      switch (supportDocument.type_document) {
        case "m":
          let elementGroup = supportDocument.element.group?.trim();
          const paidTributes = documents;
          const dataSectionF = sectionsData[SectionName.SECTION_F].data as {
            [key: string]: DataSectionBType;
          };

          if (elementGroup === "tprz") {
            const expensesBookTTI19 = paidTributes.reduce(
              (sumTotal, val) =>
                val.element.group.trim() === "tprz"
                  ? sumTotal + val.amount
                  : sumTotal,
              0
            );
            sectionsData[SectionName.SECTION_B].data["F15"] = expensesBookTTI19;
          } else if (elementGroup === "tpcm") {
            const expensesBookTTJ19 = paidTributes.reduce(
              (sumTotal, val) =>
                val.element.group.trim() === "tpcm"
                  ? sumTotal + val.amount
                  : sumTotal,
              0
            );

            sectionsData[SectionName.SECTION_C].data["F22"] = expensesBookTTJ19;
          } else if (elementGroup === "tpsv") {
            const expensesBookTTB19 = paidTributes.reduce(
              (sumTotal, val) =>
                val.element.group.trim() === "tpsv"
                  ? sumTotal + val.amount
                  : sumTotal,
              0
            );

            dataSectionF["F37"] = {
              import: expensesBookTTB19,
            };
            dataSectionF["F38"] = {
              import: null,
            };
          } else if (elementGroup === "tpft") {
            const expensesBookTTC19 = paidTributes.reduce(
              (sumTotal, val) =>
                val.element.group.trim() === "tpft"
                  ? sumTotal + val.amount
                  : sumTotal,
              0
            );

            dataSectionF["F39"] = {
              import: expensesBookTTC19,
            };
          } else if (elementGroup === "tpdc") {
            const expensesBookTTD19 = paidTributes.reduce(
              (sumTotal, val) =>
                val.element.group.trim() === "tpdc"
                  ? sumTotal + val.amount
                  : sumTotal,
              0
            );

            dataSectionF["F40"] = {
              import: expensesBookTTD19,
            };
          } else if (elementGroup === "tpdc") {
            const expensesBookTTD19 = paidTributes.reduce(
              (sumTotal, val) =>
                val.element.group.trim() === "tpdc"
                  ? sumTotal + val.amount
                  : sumTotal,
              0
            );

            dataSectionF["F40"] = {
              import: expensesBookTTD19,
            };
          } else if (elementGroup === "tpan") {
            const expensesBookTTE19 = paidTributes.reduce(
              (sumTotal, val) =>
                val.element.group.trim() === "tpan"
                  ? sumTotal + val.amount
                  : sumTotal,
              0
            );

            dataSectionF["F41"] = {
              import: expensesBookTTE19,
            };
          } else if (elementGroup === "tpcs") {
            const expensesBookTTF19 = paidTributes.reduce(
              (sumTotal, val) =>
                val.element.group.trim() === "tpcs"
                  ? sumTotal + val.amount
                  : sumTotal,
              0
            );

            dataSectionF["F42"] = {
              import: expensesBookTTF19,
            };
          } else if (elementGroup === "tpot") {
            const expensesBookTTG19 = paidTributes.reduce(
              (sumTotal, val) =>
                val.element.group.trim() === "tpot"
                  ? sumTotal + val.amount
                  : sumTotal,
              0
            );

            dataSectionF["F43"] = {
              import: expensesBookTTG19,
            };
          }

          if (elementGroup !== supportDocument.__oldGroup__) {
            elementGroup = supportDocument.__oldGroup__;
            if (elementGroup === "tprz") {
              const expensesBookTTI19 = paidTributes.reduce(
                (sumTotal, val) =>
                  val.element.group.trim() === "tprz"
                    ? sumTotal + val.amount
                    : sumTotal,
                0
              );
              sectionsData[SectionName.SECTION_B].data["F15"] =
                expensesBookTTI19;
            } else if (elementGroup === "tpcm") {
              const expensesBookTTJ19 = paidTributes.reduce(
                (sumTotal, val) =>
                  val.element.group.trim() === "tpcm"
                    ? sumTotal + val.amount
                    : sumTotal,
                0
              );

              sectionsData[SectionName.SECTION_C].data["F22"] =
                expensesBookTTJ19;
            } else if (elementGroup === "tpsv") {
              const expensesBookTTB19 = paidTributes.reduce(
                (sumTotal, val) =>
                  val.element.group.trim() === "tpsv"
                    ? sumTotal + val.amount
                    : sumTotal,
                0
              );

              dataSectionF["F37"] = {
                import: expensesBookTTB19,
              };
              dataSectionF["F38"] = {
                import: null,
              };
            } else if (elementGroup === "tpft") {
              const expensesBookTTC19 = paidTributes.reduce(
                (sumTotal, val) =>
                  val.element.group.trim() === "tpft"
                    ? sumTotal + val.amount
                    : sumTotal,
                0
              );

              dataSectionF["F39"] = {
                import: expensesBookTTC19,
              };
            } else if (elementGroup === "tpdc") {
              const expensesBookTTD19 = paidTributes.reduce(
                (sumTotal, val) =>
                  val.element.group.trim() === "tpdc"
                    ? sumTotal + val.amount
                    : sumTotal,
                0
              );

              dataSectionF["F40"] = {
                import: expensesBookTTD19,
              };
            } else if (elementGroup === "tpdc") {
              const expensesBookTTD19 = paidTributes.reduce(
                (sumTotal, val) =>
                  val.element.group.trim() === "tpdc"
                    ? sumTotal + val.amount
                    : sumTotal,
                0
              );

              dataSectionF["F40"] = {
                import: expensesBookTTD19,
              };
            } else if (elementGroup === "tpan") {
              const expensesBookTTE19 = paidTributes.reduce(
                (sumTotal, val) =>
                  val.element.group.trim() === "tpan"
                    ? sumTotal + val.amount
                    : sumTotal,
                0
              );

              dataSectionF["F41"] = {
                import: expensesBookTTE19,
              };
            } else if (elementGroup === "tpcs") {
              const expensesBookTTF19 = paidTributes.reduce(
                (sumTotal, val) =>
                  val.element.group.trim() === "tpcs"
                    ? sumTotal + val.amount
                    : sumTotal,
                0
              );

              dataSectionF["F42"] = {
                import: expensesBookTTF19,
              };
            } else if (elementGroup === "tpot") {
              const expensesBookTTG19 = paidTributes.reduce(
                (sumTotal, val) =>
                  val.element.group.trim() === "tpot"
                    ? sumTotal + val.amount
                    : sumTotal,
                0
              );

              dataSectionF["F43"] = {
                import: expensesBookTTG19,
              };
            }
          }

          const importF44 = parseFloat(
            Object.values({ ...dataSectionF, F44: { import: null } })
              .reduce((sumaTotal, val) => sumaTotal + val.import, 0)
              .toFixed()
          );
          dataSectionF["F44"] = {
            import: importF44,
          };
          sectionsData[SectionName.SECTION_F].data = dataSectionF;
          sectionsData[SectionName.SECTION_B].data["F14"] = importF44;
          break;

        case "g":
          const newDataSectionAG: { [key: string | number]: DataSectionAType } =
            {};
          const newTotalSectionAG: TotalSectionAType = {
            incomes: 0,
            expenses: 0,
          };

          for (let i = 0; i < profileActivities.length; i++) {
            const activity = profileActivities[i];
            const { date_start, date_end } = activity;
            const { code, description } = activity.activity;
            const date_start_day = moment(date_start).date();
            const date_start_month = moment(date_start).month() + 1;
            const date_end_day = moment(date_end).date();
            const date_end_month = moment(date_end).month() + 1;
            const { income, expense } = activity.supportDocuments.reduce(
              (sumaTotal, val) => {
                if (
                  val.type_document === "i" &&
                  val.element.group?.trim() === "iggv"
                ) {
                  sumaTotal.income += parseFloat(val.amount.toFixed());
                } else if (
                  val.type_document === "g" &&
                  val.element.group?.startsWith("pd")
                ) {
                  sumaTotal.expense += parseFloat(val.amount.toFixed());
                }

                return sumaTotal;
              },
              { income: 0, expense: 0 }
            );

            const data: DataSectionAType = {
              activity: `${code} - ${description}`,
              period: {
                start: [date_start_day, date_start_month],
                end: [date_end_day, date_end_month],
              },
              income,
              expense,
            };
            newDataSectionAG[`F${i + 1}`] = data;
            newTotalSectionAG.incomes += income;
            newTotalSectionAG.expenses += expense;
          }
          sectionsData[SectionName.SECTION_A].data = newDataSectionAG;
          sectionsData[SectionName.SECTION_A].totals = newTotalSectionAG;
          sectionsData[SectionName.SECTION_B].data["F11"] =
            newTotalSectionAG.incomes;
          sectionsData[SectionName.SECTION_B].data["F13"] =
            newTotalSectionAG.expenses;

          const expensesDD = documents.filter(
            (val) =>
              val.type_document === "g" &&
              val.element.is_general &&
              val.element.group?.trim() === "ddgt"
          );

          const expensesBookTGP19 = expensesDD.reduce(
            (sumaTotal, val) => sumaTotal + val.amount,
            0
          );

          sectionsData[SectionName.SECTION_B].data["F16"] = parseFloat(
            expensesBookTGP19.toFixed()
          );
          break;

        case "i":
          const newDataSectionA: { [key: string | number]: DataSectionAType } =
            {};
          const newTotalSectionA: TotalSectionAType = {
            incomes: 0,
            expenses: 0,
          };

          for (let i = 0; i < profileActivities.length; i++) {
            const activity = profileActivities[i];
            const { date_start, date_end } = activity;
            const { code, description } = activity.activity;
            const date_start_day = moment(date_start).date();
            const date_start_month = moment(date_start).month() + 1;
            const date_end_day = moment(date_end).date();
            const date_end_month = moment(date_end).month() + 1;
            const { income, expense } = activity.supportDocuments.reduce(
              (sumaTotal, val) => {
                if (
                  val.type_document === "i" &&
                  val.element.group?.trim() === "iggv"
                ) {
                  sumaTotal.income += parseFloat(val.amount.toFixed());
                } else if (
                  val.type_document === "g" &&
                  val.element.group?.startsWith("pd")
                ) {
                  sumaTotal.expense += parseFloat(val.amount.toFixed());
                }

                return sumaTotal;
              },
              { income: 0, expense: 0 }
            );

            const data: DataSectionAType = {
              activity: `${code} - ${description}`,
              period: {
                start: [date_start_day, date_start_month],
                end: [date_end_day, date_end_month],
              },
              income,
              expense,
            };

            newDataSectionA[`F${i + 1}`] = data;
            newTotalSectionA.incomes += income;
            newTotalSectionA.expenses += expense;
          }
          sectionsData[SectionName.SECTION_A].data = newDataSectionA;
          sectionsData[SectionName.SECTION_A].totals = newTotalSectionA;
          sectionsData[SectionName.SECTION_B].data["F11"] =
            newTotalSectionA.incomes;
          sectionsData[SectionName.SECTION_B].data["F13"] =
            newTotalSectionA.expenses;
          break;

        case "o":
          const group = supportDocument.element.group?.trim();
          const allDocumentToGroup = documents.filter(
            (val) =>
              val.type_document === "o" && val.element.group?.trim() === group
          );

          const upFile = parseFloat(
            allDocumentToGroup
              .reduce((sumaTotal, val) => sumaTotal + val.amount, 0)
              .toFixed()
          );

          if (group === "onex") {
            sectionsData[SectionName.SECTION_B].data["F17"] = upFile;
          } else if (group === "onda") {
            sectionsData[SectionName.SECTION_B].data["F18"] = upFile;
          } else if (group === "onfp") {
            sectionsData[SectionName.SECTION_B].data["F19"] = upFile;
          } else if (group === "onpa") {
            sectionsData[SectionName.SECTION_C].data["F23"] = upFile;
          } else if (group === "onrt") {
            sectionsData[SectionName.SECTION_C].data["F24"] = upFile;
          } else if (group === "onbn") {
            sectionsData[SectionName.SECTION_C].data["F25"] = upFile;
          } else if (group === "onde") {
            sectionsData[SectionName.SECTION_E].data["F34"] = upFile;
          }

          if (group !== supportDocument.__oldGroup__) {
            const allDocumentToGroup = documents.filter(
              (val) =>
                val.type_document === "o" &&
                val.element.group?.trim() === supportDocument.__oldGroup__
            );

            const upFile = parseFloat(
              allDocumentToGroup
                .reduce((sumaTotal, val) => sumaTotal + val.amount, 0)
                .toFixed()
            );

            if (supportDocument.__oldGroup__ === "onex") {
              sectionsData[SectionName.SECTION_B].data["F17"] = upFile;
            } else if (supportDocument.__oldGroup__ === "onda") {
              sectionsData[SectionName.SECTION_B].data["F18"] = upFile;
            } else if (supportDocument.__oldGroup__ === "onfp") {
              sectionsData[SectionName.SECTION_B].data["F19"] = upFile;
            } else if (supportDocument.__oldGroup__ === "onpa") {
              sectionsData[SectionName.SECTION_C].data["F23"] = upFile;
            } else if (supportDocument.__oldGroup__ === "onrt") {
              sectionsData[SectionName.SECTION_C].data["F24"] = upFile;
            } else if (supportDocument.__oldGroup__ === "onbn") {
              sectionsData[SectionName.SECTION_C].data["F25"] = upFile;
            } else if (supportDocument.__oldGroup__ === "onde") {
              sectionsData[SectionName.SECTION_E].data["F34"] = upFile;
            }
          }
          break;

        default:
          break;
      }

      const dataSectionB = sectionsData[SectionName.SECTION_B].data as {
        [key: string]: number;
      };
      sectionsData[SectionName.SECTION_B].data["F20"] =
        calculeF20ToDj08(dataSectionB);

      const { constantToSectionG } = appConfig;
      const F20 = sectionsData[SectionName.SECTION_B].data["F20"] as number;

      const dataSectionG = sectionsData[SectionName.SECTION_G].data as {
        [key: string]: DataSectionGType;
      };
      const totalSectionG: TotalSectionGType = {
        baseImponible: 0,
        import: 0,
      };

      constantToSectionG.reduce((count, val) => {
        const { from, to, porcentageType } = val;
        let baseImponible = 0;

        if (to === null) {
          baseImponible =
            F20 > from ? F20 - (totalSectionG?.baseImponible || 0) : 0;
        } else {
          baseImponible =
            F20 > to ? to - from : F20 - (totalSectionG?.baseImponible || 0);
        }

        const importe = parseFloat(
          ((baseImponible * porcentageType) / 100).toFixed()
        );

        const newRow: DataSectionGType = {
          ...val,
          baseImponible: parseFloat(baseImponible.toFixed()),
          import: importe,
        };

        dataSectionG[`F${count}`] = newRow;
        totalSectionG["baseImponible"] += baseImponible;
        totalSectionG["import"] += importe;

        return count + 1;
      }, 45);

      sectionsData[SectionName.SECTION_G] = {
        data: dataSectionG,
        totals: totalSectionG,
      };
      sectionsData[SectionName.SECTION_C].data["F21"] = totalSectionG.import;

      dj08ToUpdate.section_data = JSON.stringify(sectionsData);
      await dj08ToUpdate.save();
    } catch (error) {
      console.log("ERROR EN DJ-08: ", error.message);
      return error.message;
    }
  }

  private async getInitializeUpdateDj08Data(
    fiscalYearId: number,
    type: string
  ): Promise<[Dj08SectionData, SupportDocument[], ProfileActivity[]]> {
    const profileActivities = await getProfileActivities(fiscalYearId, type);

    const data = await Promise.all([
      getDJ08SectionsData(fiscalYearId),
      getDocumentsFiscalYearOrOfTheProfileActivity(
        fiscalYearId,
        type,
        profileActivities
      ),
    ]);
    return [...data, profileActivities];
  }

  private updateDj08Sections(sectionsData: AllDataSectionsDj08Type): string {
    const dataSectionB = this.getSectionValue<{ [key: string]: number }>(
      sectionsData,
      SectionName.SECTION_B
    );
    const F20 = calculeF20ToDj08(dataSectionB);
    this.setSectionValue(sectionsData, SectionName.SECTION_B, "F20", F20);

    const dataSectionG = this.getSectionValue<ObjectSectionGType>(
      sectionsData,
      SectionName.SECTION_G
    );
    const data = setDataSectionG(F20, 45, dataSectionG);
    sectionsData[SectionName.SECTION_G] = data;
    this.setSectionValue(
      sectionsData,
      SectionName.SECTION_C,
      "F21",
      data.totals.import
    );

    return JSON.stringify(sectionsData);
  }

  private getSectionValue<T>(
    sectionsData: AllDataSectionsDj08Type,
    section: SectionName
  ): T {
    return sectionsData[section].data as unknown as T;
  }

  private setSectionValue(
    sectionsData: AllDataSectionsDj08Type,
    section: SectionName,
    row: string,
    value: number
  ): void {
    sectionsData[section].data[row] = value;
  }

  /**
   * @AfterInsert
   * @AfterUpdate
   */
  private async cuadre(
    supportDocument: SupportDocument
  ): Promise<void | string> {
    try {
      const {
        date,
        type_document: type,
        is_bank,
        amount,
        fiscalYear,
      } = supportDocument;
      const { group, account } = supportDocument.element;
      const isMethodCreate = !supportDocument.voucher;

      if (fiscalYear.run_acounting) {
        if (!account)
          throw new Error("It is required Account of the Elemento.");

        const voucher =
          supportDocument.voucher ||
          (await this.createVoucher(supportDocument));
        const voucherDetailsToUpdateMayor = [
          ...(voucher?.voucherDetails || []),
        ];

        const groupTrim = group.trim();
        const [[accountDebe, debe], [accountHaber, haber]] = await Promise.all([
          this.getDebeDetails(type, groupTrim, is_bank, amount),
          this.getHaberDetails(type, groupTrim, amount, account),
        ]);

        const createVoucherDetails = this.createVoucherDetails(
          voucher,
          accountDebe,
          accountHaber,
          debe,
          haber
        );

        if (isMethodCreate) {
          voucher.voucherDetails = createVoucherDetails;
        } else {
          this.updateVoucherDetails(voucher, createVoucherDetails);
          this.updateMayors(voucher, date, accountDebe, accountHaber);
        }

        const resultVoucher = await voucher.save();
        voucherDetailsToUpdateMayor.push(...resultVoucher.voucherDetails);

        for (const voucherDetail of voucherDetailsToUpdateMayor) {
          await updateMayors({
            id: voucherDetail.mayor?.id,
            date,
            fiscalYear,
            voucherDetail,
          });
        }
      }
    } catch (error) {
      console.log("ERROR EN CUADRE: ", error.message);
      return error.message;
    }
  }

  private updateMayors(
    voucher: Voucher,
    date: Date,
    accountDebe: Account,
    accountHaber: Account
  ): void {
    for (const voucherDetail of voucher.voucherDetails) {
      if (!accountDebe || !accountDebe) return;

      if (!voucherDetail.haber) {
        voucherDetail.mayor.date = date;
        voucherDetail.mayor.account = accountDebe;
      } else {
        voucherDetail.mayor.date = date;
        voucherDetail.mayor.account = accountHaber;
      }
    }
  }

  private async createVoucher(
    supportDocument: SupportDocument
  ): Promise<Voucher> {
    return await Voucher.create({
      number: -1,
      description: supportDocument.description,
      date: supportDocument.date,
      supportDocument,
    }).save();
  }

  private getDebeCode(group: string, is_bank: boolean): string {
    return (
      (group === "omcb" && "110") ||
      (group === "ombc" && "100") ||
      (group === "omcl" && "520") ||
      (group === "omlc" && "470") ||
      (group === "onrt" && "900-10") ||
      (is_bank ? "110" : "100")
    );
  }

  private getHaberCode(group: string): string {
    return (
      (group === "omcb" && "100") ||
      (group === "ombc" && "110") ||
      (group === "omcl" && "470") ||
      (group === "omlc" && "520") ||
      (group === "onrt" && "470")
    );
  }

  private calculateDebe(
    type: string,
    group: string,
    amount: number
  ): number | null {
    const elementGroupDebe = [
      "omap",
      "omlp",
      "omcp",
      "omcb",
      "ombc",
      "onex",
      "onfp",
      "onpa",
      "onbn",
    ];

    return type === "i" || elementGroupDebe.includes(group) ? amount : null;
  }

  private calculateHaber(
    type: string,
    group: string,
    amount: number
  ): number | null {
    const elementGroupHaber = [
      "niei",
      "ompp",
      "omrt",
      "onda",
      "onde",
      "omcl",
      "omlc",
      "onrt",
    ];

    return type === "g" || type === "m" || elementGroupHaber.includes(group)
      ? amount
      : null;
  }

  private async getDebeDetails(
    type: string,
    group: string,
    is_bank: boolean,
    amount: number
  ): Promise<[Account, number | null]> {
    const codeDebe = this.getDebeCode(group, is_bank);
    const accountDebe = await Account.findOne({
      where: { code: codeDebe },
    });

    const debe = this.calculateDebe(type, group, amount);

    return [accountDebe, debe];
  }

  private async getHaberDetails(
    type: string,
    group: string,
    amount: number,
    defaultAccount: Account
  ): Promise<[Account, number | null]> {
    const codeHaber = this.getHaberCode(group);
    const accountHaber = codeHaber
      ? await Account.findOne({ where: { code: codeHaber } })
      : defaultAccount;

    const haber = this.calculateHaber(type, group, amount);

    return [accountHaber, haber];
  }

  private createVoucherDetails(
    voucher: Voucher,
    accountDebe: Account,
    accountHaber: Account,
    debe: number | null,
    haber: number | null
  ): VoucherDetail[] {
    if (!accountDebe || !accountHaber)
      throw new Error(
        "Create voucher details required one (accountDebe and accountHaber)."
      );

    return [
      VoucherDetail.create({
        debe: debe || 0,
        haber: haber || 0,
        voucher,
        account: accountDebe,
      }),
      VoucherDetail.create({
        debe: haber || 0,
        haber: debe || 0,
        voucher,
        account: accountHaber,
      }),
    ];
  }

  private updateVoucherDetails(
    voucher: Voucher,
    createVoucherDetails: VoucherDetail[]
  ): void {
    const [voucherDetailDebe, voucherDetailHaber] = voucher.voucherDetails;
    voucher.voucherDetails = [
      { ...voucherDetailDebe, ...createVoucherDetails[0] } as VoucherDetail,
      { ...voucherDetailHaber, ...createVoucherDetails[1] } as VoucherDetail,
    ];
  }

  private async getAccountElement(element: Element): Promise<Account> {
    return (
      await Element.findOne({
        select: { account: { id: true, code: true } },
        relations: { account: true },
        where: { id: element.id },
      })
    )?.account;
  }

  private setBalanced(): void {
    this.balanced = !this.balanced;
  }

  /**
   * runCuadre
   * @method
   * "Para crear la contabilidad desde otro sistema."
   */
  public async runCuadre(supportDocument: SupportDocument): Promise<void> {
    const isError = await this.cuadre(supportDocument);

    if (isError) throw new Error(isError);
  }
}
