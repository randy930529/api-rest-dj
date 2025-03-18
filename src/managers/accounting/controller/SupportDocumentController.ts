import { NextFunction, Request, Response } from "express";
import * as moment from "moment";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { responseError } from "../../../errors/responseError";
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
  ObjectSectionAType,
  ObjectSectionBType,
  ObjectSectionGType,
  TotalSectionAType,
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
import {
  getDocumentGroup,
  getDocumentsOfToGroup,
  getParseDJ08SectionsData,
  getTotalAmountInDocuments,
  isExpensesDD,
  setDataSectionG,
} from "../utils/updateDJ08";
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

      if (supportDocument.element.group.trim() === "emty") return;

      const [dj08ToUpdate, documents, profileActivities] =
        await this.getInitializeUpdateDj08Data(fiscalYearId, type_document);
      const sectionsData =
        getParseDJ08SectionsData<AllDataSectionsDj08Type>(dj08ToUpdate);

      switch (supportDocument.type_document) {
        case "m":
          this.updateTaxes(sectionsData, supportDocument, documents);
          break;

        case "g":
          this.updateExpenses(sectionsData, profileActivities, documents);
          break;

        case "i":
          this.updateIncomes(sectionsData, profileActivities);
          break;

        case "o":
          this.updateOthers(sectionsData, supportDocument, documents);
          break;

        default:
          break;
      }

      dj08ToUpdate.section_data = this.updateDj08Sections(sectionsData);

      await dj08ToUpdate.save();
    } catch (error) {
      console.log("ERROR EN DJ-08: ", error.message);
      return error.message;
    }
  }

  private updateTaxes(
    sectionsData: AllDataSectionsDj08Type,
    document: SupportDocument,
    documents: SupportDocument[]
  ) {
    const elementGroup = getDocumentGroup(document);
    const dataSectionF = this.getSectionValue<ObjectSectionBType>(
      sectionsData,
      SectionName.SECTION_F
    );
    let totalExpenses = this.calculeTotalExpensesOfToGroup(
      elementGroup,
      documents
    );

    if (elementGroup === "tpss" || elementGroup === "trss") {
      totalExpenses += this.calculeTotalExpensesOfToGroup(
        elementGroup === "tpss" ? "trss" : "tpss",
        documents
      );
    }

    let row = this.getTaxeRowKey(elementGroup);

    if (!row) return;

    this.setSectionTaxesValueRows(
      sectionsData,
      dataSectionF,
      row,
      totalExpenses
    );

    if (elementGroup !== document.__oldGroup__) {
      totalExpenses = this.calculeTotalExpensesOfToGroup(
        document.__oldGroup__,
        documents
      );
      row = this.getTaxeRowKey(document.__oldGroup__);

      if (!row) return;

      this.setSectionTaxesValueRows(
        sectionsData,
        dataSectionF,
        row,
        totalExpenses
      );
    }

    const importF44 = this.calculeValueF44(
      Object.values<DataSectionBType>({ ...dataSectionF, F44: { import: 0 } })
    );

    this.setDataRowsToSectionF(dataSectionF, "F44", importF44);
    this.setSectionValue(sectionsData, SectionName.SECTION_B, "F14", importF44);
    sectionsData[SectionName.SECTION_F].data = dataSectionF;
  }

  private updateExpenses(
    sectionsData: AllDataSectionsDj08Type,
    profileActivities: ProfileActivity[],
    documents: SupportDocument[]
  ) {
    const [newDataSectionAG, newTotalSectionAG] =
      this.generateDataSectionA(profileActivities);

    this.setSectionAValues(sectionsData, newDataSectionAG, newTotalSectionAG);

    const expensesBookTGP19 = getTotalAmountInDocuments(
      this.getDocumentsExpensesDD(documents)
    );

    this.setSectionValue(
      sectionsData,
      SectionName.SECTION_B,
      "F16",
      parseFloat(expensesBookTGP19.toFixed())
    );
  }

  private updateIncomes(
    sectionsData: AllDataSectionsDj08Type,
    profileActivities: ProfileActivity[]
  ) {
    const [newDataSectionAG, newTotalSectionAG] =
      this.generateDataSectionA(profileActivities);

    this.setSectionAValues(sectionsData, newDataSectionAG, newTotalSectionAG);
  }

  private updateOthers(
    sectionsData: AllDataSectionsDj08Type,
    document: SupportDocument,
    documents: SupportDocument[]
  ) {
    const elementGroup = getDocumentGroup(document);
    let total = this.calculeTotalExpensesOfToGroup(elementGroup, documents);
    let row = this.getOtherRowKey(elementGroup);

    this.setSectionOthersValueRows(sectionsData, row, total);

    if (elementGroup !== document.__oldGroup__) {
      total = this.calculeTotalExpensesOfToGroup(
        document.__oldGroup__,
        documents
      );
      row = this.getOtherRowKey(document.__oldGroup__);

      this.setSectionOthersValueRows(sectionsData, row, total);
    }
  }

  private async getInitializeUpdateDj08Data(
    fiscalYearId: number,
    type: string
  ): Promise<[Dj08SectionData, SupportDocument[], ProfileActivity[]]> {
    const profileActivities = await getProfileActivities(fiscalYearId, type);

    const [sectionsData, documents] = await Promise.all([
      getDJ08SectionsData(fiscalYearId),
      getDocumentsFiscalYearOrOfTheProfileActivity(
        fiscalYearId,
        type,
        profileActivities
      ),
    ]);
    return [sectionsData, documents, profileActivities];
  }

  private getSectionValue<T>(
    sectionsData: AllDataSectionsDj08Type,
    section: SectionName
  ): T {
    return sectionsData[section].data as unknown as T;
  }

  private getTaxeRowKey(group: string): string {
    if (!group) return;

    return (
      (group === "tprz" && "F15") ||
      (group === "tpcm" && "F22") ||
      (group === "tpsv" && "F37") ||
      (group === "tpft" && "F38") ||
      (group === "tpdc" && "F39") ||
      (group === "tpan" && "F40") ||
      (group === "tpcs" && "F41") ||
      (group === "tpss" && "F42") ||
      (group === "trss" && "F42") ||
      (group === "tpot" && "F43") ||
      null
    );
  }

  private getOtherRowKey(group: string): string {
    if (!group) return;

    const row =
      (group === "onex" && "F17") ||
      (group === "onda" && "F18") ||
      (group === "onfp" && "F19") ||
      (group === "onpa" && "F23") ||
      (group === "onrt" && "F24") ||
      (group === "onbn" && "F25") ||
      (group === "onde" && "F34") ||
      null;

    if (
      [
        "omap",
        "omlp",
        "omcp",
        "omcb",
        "ombc",
        "omcl",
        "omlc",
        "ompp",
        "omrt",
        "emty",
      ].includes(group)
    )
      return;

    return row;
  }

  private updateDj08Sections(sectionsData: AllDataSectionsDj08Type): string {
    const F20 = this.setSectionB_F20(sectionsData);
    this.setSectionGAndSectionC_F21(F20, sectionsData);

    return JSON.stringify(sectionsData);
  }

  private setSectionB_F20(sectionsData: AllDataSectionsDj08Type): number {
    const dataSectionB = this.getSectionValue<{ [key: string]: number }>(
      sectionsData,
      SectionName.SECTION_B
    );
    const F20 = calculeF20ToDj08(dataSectionB);
    this.setSectionValue(sectionsData, SectionName.SECTION_B, "F20", F20);

    return F20;
  }

  private setDataRowsToSectionF(
    dataSection: ObjectSectionBType,
    row: string,
    value: number
  ) {
    dataSection[row] = {
      import: value,
    };
  }

  private setSectionGAndSectionC_F21(
    F20: number,
    sectionsData: AllDataSectionsDj08Type
  ) {
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
  }

  private setSectionTaxesValueRows(
    sectionsData: AllDataSectionsDj08Type,
    sectionF: ObjectSectionBType,
    row: string,
    value: number
  ) {
    if (!row) return;

    if (row === "F15" || row === "F22") {
      const section =
        row === "F15" ? SectionName.SECTION_B : SectionName.SECTION_C;
      this.setSectionValue(sectionsData, section, row, value);
    } else {
      this.setDataRowsToSectionF(sectionF, row, value);
    }
  }

  private setSectionOthersValueRows(
    sectionsData: AllDataSectionsDj08Type,
    row: string,
    value: number
  ) {
    if (!row) return;
    const section = this.getSectionOthers(row);

    if (!section) return;
    this.setSectionValue(sectionsData, section, row, value);
  }

  private getSectionOthers(row: string): SectionName {
    return (
      (row === "F17" && SectionName.SECTION_B) ||
      (row === "F18" && SectionName.SECTION_B) ||
      (row === "F19" && SectionName.SECTION_B) ||
      (row === "F23" && SectionName.SECTION_C) ||
      (row === "F24" && SectionName.SECTION_C) ||
      (row === "F25" && SectionName.SECTION_C) ||
      (row === "F34" && SectionName.SECTION_E) ||
      null
    );
  }

  private calculeTotalExpensesOfToGroup(
    group: string,
    documents: SupportDocument[]
  ): number {
    const documentsOfToGroup = getDocumentsOfToGroup(group, documents);

    return getTotalAmountInDocuments(documentsOfToGroup);
  }

  private calculeValueF44(data: DataSectionBType[]): number {
    const value = data
      .reduce((sumaTotal, { import: amount }) => sumaTotal + amount, 0)
      .toFixed();
    return parseFloat(value);
  }

  private setSectionValue(
    sectionsData: AllDataSectionsDj08Type,
    section: SectionName,
    row: string,
    value: number
  ): void {
    sectionsData[section].data[row] = value;
  }

  private generateDataSectionA(
    activities: ProfileActivity[]
  ): [ObjectSectionAType, TotalSectionAType] {
    const newData: ObjectSectionAType = {};
    const newTotals: TotalSectionAType = {
      incomes: 0,
      expenses: 0,
    };

    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      const { code, description } = activity.activity;
      const activityDate = this.getActivityDayAndMonth(
        activity.date_start,
        activity.date_end
      );

      const { incomes, expenses } = this.getTotalIncomeAndExpenseInActivities(
        activity.supportDocuments
      );

      const data = this.createDataSectionA(
        code,
        description,
        activityDate,
        incomes,
        expenses
      );

      newData[`F${i + 1}`] = data;
      newTotals.incomes += incomes;
      newTotals.expenses += expenses;
    }

    return [newData, newTotals];
  }

  private getActivityDayAndMonth(
    date_start: Date,
    date_end: Date
  ): [number, number, number, number] {
    return [
      moment(date_start).date(),
      moment(date_start).month() + 1,
      moment(date_end).date(),
      moment(date_end).month() + 1,
    ];
  }

  private getTotalIncomeAndExpenseInActivities(
    documents: SupportDocument[]
  ): TotalSectionAType {
    return documents.reduce<TotalSectionAType>(
      (sumaTotal, val) => {
        const elementGroup = getDocumentGroup(val);
        return this.getSumaTotalIncomesAndExpenses(
          sumaTotal,
          val.type_document,
          elementGroup,
          val.amount
        );
      },
      { incomes: 0, expenses: 0 }
    );
  }

  private getSumaTotalIncomesAndExpenses(
    sumaTotal: TotalSectionAType,
    type: string,
    group: string,
    amount: number
  ): TotalSectionAType {
    const key = this.getKeySumaTotal(type, group);

    if (key) {
      sumaTotal[key] += parseFloat(amount.toFixed());
    }

    return sumaTotal;
  }

  private getKeySumaTotal(type: string, group: string): string {
    return (
      (type === "i" && group === "iggv" && "incomes") ||
      (type === "g" && group?.startsWith("pd") && "expenses") ||
      null
    );
  }

  private createDataSectionA(
    code: string,
    description: string,
    activityDate: number[],
    income: number,
    expense: number
  ): DataSectionAType {
    return {
      activity: `${code} - ${description}`,
      period: {
        start: activityDate.slice(0, 2),
        end: activityDate.slice(2),
      },
      income,
      expense,
    };
  }

  private setSectionAValues(
    sectionsData: AllDataSectionsDj08Type,
    data: ObjectSectionAType,
    totals: TotalSectionAType
  ) {
    sectionsData[SectionName.SECTION_A].data = data;
    sectionsData[SectionName.SECTION_A].totals = totals;
    this.setSectionValue(
      sectionsData,
      SectionName.SECTION_B,
      "F11",
      totals.incomes
    );
    this.setSectionValue(
      sectionsData,
      SectionName.SECTION_B,
      "F13",
      totals.expenses
    );
  }

  private getDocumentsExpensesDD(
    documents: SupportDocument[]
  ): SupportDocument[] {
    return documents.filter((document) => {
      const elementGroup = getDocumentGroup(document);
      return isExpensesDD(
        document.type_document,
        document.element.is_general,
        elementGroup
      );
    });
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
      (group === "trss" && "500") ||
      (group === "niss" && "500") ||
      (group === "onrt" && "600-40") ||
      (is_bank ? "110" : "100")
    );
  }

  private getHaberCode(group: string): string {
    return (
      (group === "omcb" && "100") ||
      (group === "ombc" && "110") ||
      (group === "omcl" && "470") ||
      (group === "omlc" && "520") ||
      (group === "onrt" && "900-10")
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
      "emty",
    ];

    if (type === "i" && group === "emty") return null;

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
