import { NextFunction, Request, Response } from "express";
import * as moment from "moment";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { SupportDocument } from "../../../entity/SupportDocument";
import { SupportDocumentDTO } from "../dto/request/supportDocument.dto";
import { responseError } from "../../../errors/responseError";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { Element } from "../../../entity/Element";
import { FiscalYear } from "../../../entity/FiscalYear";
import { ProfileActivity } from "../../../entity/ProfileActivity";
import { Dj08SectionData, SectionName } from "../../../entity/Dj08SectionData";
import { calculeF20ToDj08 } from "../../../reports/utils/utilsToReports";
import { appConfig } from "../../../../config";
import {
  AllDataSectionsDj08Type,
  DataSectionAType,
  DataSectionBType,
  DataSectionGType,
  TotalSectionAType,
  TotalSectionGType,
} from "../../../utils/definitions";

export class SupportDocumentController extends EntityControllerBase<SupportDocument> {
  constructor() {
    const repository = AppDataSource.getRepository(SupportDocument);
    super(repository);
  }

  async createSupportDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: SupportDocumentDTO = req.body;
      const elementId = fields.element.id;
      const fiscalYearId = fields.fiscalYear.id;

      if (!elementId)
        responseError(res, "Do must provide a valid expense element id.", 404);

      if (!fiscalYearId)
        responseError(res, "Do must provide a valid fiscal yearId id.", 404);

      const elementRepository = AppDataSource.getRepository(Element);
      const fiscalYearRepository = AppDataSource.getRepository(FiscalYear);

      const element = await elementRepository.findOneBy({
        id: elementId,
      });

      if (!element) responseError(res, "Expense element not found.", 404);

      const fiscalYear = await fiscalYearRepository.findOneBy({
        id: fiscalYearId,
      });

      if (!fiscalYear) responseError(res, "Fiscal year not found.", 404);

      let profileActivity: ProfileActivity = null;
      if (fields.profileActivity) {
        const profileActivityId = fields.profileActivity.id;
        if (!profileActivityId)
          responseError(
            res,
            "Do must provide a valid expense profile activity id.",
            404
          );

        profileActivity = await ProfileActivity.findOneBy({
          id: profileActivityId,
        });
        if (!profileActivity)
          responseError(res, "Profile activity not found.", 404);
      }

      const objectSupportDocument = Object.assign(new SupportDocument(), {
        ...fields,
        element,
        fiscalYear,
        profileActivity,
      });

      const newSupportDocument = await this.create(objectSupportDocument);
      await this.updatedDJ08(newSupportDocument, false);

      const supportDocument: SupportDocumentDTO = newSupportDocument;
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
      const fields: SupportDocument = req.body;
      const { id } = req.body;

      if (!id)
        responseError(res, "Update requiere support document id valid.", 404);

      const supportDocumentToUpdate = await this.repository.findOne({
        select: {
          element: {
            id: true,
            description: true,
            type: true,
            group: true,
            is_general: true,
          },
        },
        relations: ["element"],
        where: { id },
      });

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
      await this.updatedDJ08(supportDocumentUpdate);

      const supportDocument: SupportDocumentDTO = supportDocumentUpdate;
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

  async partialUpdateSupportDocument(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const fields: SupportDocumentDTO = req.body;
      const { id } = req.body;

      if (!id)
        responseError(res, "Update requiere support document id valid.", 404);

      const fieldToUpdate: string = Object.keys(fields)[1];
      const supportDocumentToUpdate = await this.one({
        id,
        req,
        res,
      });

      const supportDocumentUpdate = Object.assign(new SupportDocument(), {
        ...supportDocumentToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      });

      await this.update({ id, res }, supportDocumentUpdate);
      await this.updatedDJ08(supportDocumentUpdate);

      const supportDocument: SupportDocumentDTO = supportDocumentUpdate;
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

  async deleteSupportDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id)
        responseError(
          res,
          "Delete support document requiere one id valid.",
          404
        );

      const supportDocumentToRemove = await this.repository.findOne({
        select: {
          element: {
            id: true,
            description: true,
            group: true,
            is_general: true,
          },
          profileActivity: { id: true },
        },
        relations: { element: true, profileActivity: true },
        where: { id },
      });

      if (!supportDocumentToRemove)
        responseError(res, "Entity SUPPORTDOCUMENT not found.", 404);

      const removeSupportDocument = await this.repository.remove(
        supportDocumentToRemove
      );
      await this.updatedDJ08(removeSupportDocument);

      res.status(204);
      return "Support document has been removed successfully.";
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
  async updatedDJ08(
    supportDocument: SupportDocument,
    up: boolean = true
  ): Promise<void> {
    const dj08ToUpdate = await Dj08SectionData.findOne({
      where: {
        dJ08: { fiscalYear: { id: supportDocument.__fiscalYearId__ } },
        is_rectification: true,
      },
    });
    const { section_data: sectionDataJSONString } = dj08ToUpdate;
    const section_data: AllDataSectionsDj08Type = JSON.parse(
      sectionDataJSONString
    );

    const profileActivities =
      supportDocument.type_document === "g" ||
      supportDocument.type_document === "i"
        ? await ProfileActivity.find({
            select: {
              supportDocuments: {
                id: true,
                type_document: true,
                amount: true,
                element: {
                  id: true,
                  description: true,
                  group: true,
                  is_general: true,
                },
              },
              activity: { id: true, code: true, description: true },
            },
            relations: { activity: true, supportDocuments: { element: true } },
            where: {
              supportDocuments: {
                fiscalYear: { id: supportDocument.__fiscalYearId__ },
              },
            },
          })
        : [];

    const documents =
      supportDocument.type_document === "g" ||
      supportDocument.type_document === "i"
        ? profileActivities.reduce<SupportDocument[]>((documents, activity) => {
            documents = [...documents, ...activity.supportDocuments];
            return documents;
          }, [])
        : (
            await FiscalYear.findOne({
              select: {
                supportDocuments: {
                  id: true,
                  type_document: true,
                  amount: true,
                  element: {
                    id: true,
                    description: true,
                    type: true,
                    group: true,
                    is_general: true,
                  },
                },
              },
              relations: { supportDocuments: { element: true } },
              where: {
                id: supportDocument.__fiscalYearId__,
                supportDocuments: {
                  type_document: supportDocument.type_document,
                },
              },
            })
          )?.supportDocuments || [];

    switch (supportDocument.type_document) {
      case "m":
        let elementGroup = supportDocument.element.group?.trim();
        const paidTributes = documents;
        const dataSectionF = section_data[SectionName.SECTION_F].data as {
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
          section_data[SectionName.SECTION_B].data["F15"] = expensesBookTTI19;
        } else if (elementGroup === "tpcm") {
          const expensesBookTTJ19 = paidTributes.reduce(
            (sumTotal, val) =>
              val.element.group.trim() === "tpcm"
                ? sumTotal + val.amount
                : sumTotal,
            0
          );

          section_data[SectionName.SECTION_C].data["F22"] = expensesBookTTJ19;
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
            section_data[SectionName.SECTION_B].data["F15"] = expensesBookTTI19;
          } else if (elementGroup === "tpcm") {
            const expensesBookTTJ19 = paidTributes.reduce(
              (sumTotal, val) =>
                val.element.group.trim() === "tpcm"
                  ? sumTotal + val.amount
                  : sumTotal,
              0
            );

            section_data[SectionName.SECTION_C].data["F22"] = expensesBookTTJ19;
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
        section_data[SectionName.SECTION_F].data = dataSectionF;
        section_data[SectionName.SECTION_B].data["F14"] = importF44;
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
        section_data[SectionName.SECTION_A].data = newDataSectionAG;
        section_data[SectionName.SECTION_A].totals = newTotalSectionAG;
        section_data[SectionName.SECTION_B].data["F11"] =
          newTotalSectionAG.incomes;
        section_data[SectionName.SECTION_B].data["F13"] =
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

        section_data[SectionName.SECTION_B].data["F16"] = parseFloat(
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
        section_data[SectionName.SECTION_A].data = newDataSectionA;
        section_data[SectionName.SECTION_A].totals = newTotalSectionA;
        section_data[SectionName.SECTION_B].data["F11"] =
          newTotalSectionA.incomes;
        section_data[SectionName.SECTION_B].data["F13"] =
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
          section_data[SectionName.SECTION_B].data["F17"] = upFile;
        } else if (group === "onda") {
          section_data[SectionName.SECTION_B].data["F18"] = upFile;
        } else if (group === "onfp") {
          section_data[SectionName.SECTION_B].data["F19"] = upFile;
        } else if (group === "onpa") {
          section_data[SectionName.SECTION_C].data["F23"] = upFile;
        } else if (group === "onrt") {
          section_data[SectionName.SECTION_C].data["F24"] = upFile;
        } else if (group === "onbn") {
          section_data[SectionName.SECTION_C].data["F25"] = upFile;
        } else if (group === "onde") {
          section_data[SectionName.SECTION_E].data["F34"] = upFile;
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
            section_data[SectionName.SECTION_B].data["F17"] = upFile;
          } else if (supportDocument.__oldGroup__ === "onda") {
            section_data[SectionName.SECTION_B].data["F18"] = upFile;
          } else if (supportDocument.__oldGroup__ === "onfp") {
            section_data[SectionName.SECTION_B].data["F19"] = upFile;
          } else if (supportDocument.__oldGroup__ === "onpa") {
            section_data[SectionName.SECTION_C].data["F23"] = upFile;
          } else if (supportDocument.__oldGroup__ === "onrt") {
            section_data[SectionName.SECTION_C].data["F24"] = upFile;
          } else if (supportDocument.__oldGroup__ === "onbn") {
            section_data[SectionName.SECTION_C].data["F25"] = upFile;
          } else if (supportDocument.__oldGroup__ === "onde") {
            section_data[SectionName.SECTION_E].data["F34"] = upFile;
          }
        }
        break;

      default:
        break;
    }

    const dataSectionB = section_data[SectionName.SECTION_B].data as {
      [key: string]: number;
    };
    section_data[SectionName.SECTION_B].data["F20"] =
      calculeF20ToDj08(dataSectionB);

    const { constantToSectionG } = appConfig;
    const F20 = section_data[SectionName.SECTION_B].data["F20"] as number;

    const dataSectionG = section_data[SectionName.SECTION_G].data as {
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

    section_data[SectionName.SECTION_G] = {
      data: dataSectionG,
      totals: totalSectionG,
    };
    section_data[SectionName.SECTION_C].data["F21"] = totalSectionG.import;

    dj08ToUpdate.section_data = JSON.stringify(section_data);
    await dj08ToUpdate.save();
  }
}
