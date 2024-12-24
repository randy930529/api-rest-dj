import { NextFunction, Request, Response } from "express";
import * as pug from "pug";
import * as moment from "moment";
import ReportGenerator from "../../base/ReportGeneratorBase";
import { responseError } from "../../errors/responseError";
import { Voucher } from "../../entity/Voucher";
import { Mayor } from "../../entity/Mayor";
import { Profile } from "../../entity/Profile";
import { CreateVoucherReport } from "../dto/request/createVoucherReport.dto";
import { CreateMayorReport } from "../dto/request/createMayorReport.dto";
import { CreateBalanceReport } from "../dto/request/createBalanceReport.dto";
import { pugTemplatePath } from "../utils/utilsToReports";
import {
  calculeNetPatrimony,
  calculeUtility,
  generateSaldoIncomesAndSaldoExpenses,
  parse2Float,
} from "../../managers/accounting/utils";
import { getLastMayorInAccounts, getSearchRange } from "../utils";
import {
  AccountingMayorType,
  AccountingVoucherType,
  DataSituationStateReportType,
  DataYieldStateReportType,
  MayorDetailType,
  SearchRangeType,
  VoucherDetailType,
} from "../../utils/definitions";
import { getDataVoucherReport } from "../utils/query/vouchers.fetch";
import { getUserSectionToReport } from "../utils/query/voucherReportSection.fetch";
import {
  getInitialBalanceOfTheFiscalYearToDateRange,
  getMayorsOfTheFiscalYearInDateRange,
  getMayorsOfTheFiscalYearUntilDate,
} from "../utils/query/mayor.fetch";

export default class ReportGeneratorAccountingController extends ReportGenerator {
  private templatePath: string;
  private defaultFileName: string;

  constructor(
    chromePath: string,
    templatePath: string,
    defaultFileName: string
  ) {
    super(chromePath);
    this.templatePath = templatePath;
    this.defaultFileName = defaultFileName || "report.pdf";
  }

  async generateVoucherReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { rangeDate, rangeVouchers, user }: CreateVoucherReport = req.body;
      this.templatePath = pugTemplatePath("accounting/voucherBook");
      const fileName = `Comprobante_[${rangeDate || ""}] - [${
        rangeVouchers || ""
      }].pdf`;

      const { profile, fiscalYear } = await getUserSectionToReport(user?.id);

      const [
        { searchRange: searchRangeDate },
        { searchRange: searchRangeNumber },
      ] = this.createVoucherSearchRanges(rangeDate, rangeVouchers);

      const vouchers = await getDataVoucherReport(
        fiscalYear?.id,
        searchRangeDate,
        searchRangeNumber
      );

      if (!vouchers.length)
        responseError(
          res,
          "No hay valores de comprobantes para el rango espesificado.",
          416
        );

      const data = this.generateVoucherReportData(profile, vouchers);

      const compiledTemplate = pug.compileFile(this.templatePath);
      const htmlContent = compiledTemplate({ data });
      const pdfBuffer = await this.generatePDF({ htmlContent });

      res.contentType("application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName || this.defaultFileName}"`
      );
      res.send(pdfBuffer);
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async generateMayorReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { date_start, date_end, account, user }: CreateMayorReport =
        req.body;
      this.templatePath = pugTemplatePath("accounting/tableBigger");
      const fileName = `Mayor de Cuenta_${account?.code}-${
        account?.description
      }-[${[date_start, date_end]}].pdf`;

      const { profile, fiscalYear } = await getUserSectionToReport(user?.id);
      const mayors = await getMayorsOfTheFiscalYearInDateRange(
        fiscalYear?.id,
        account?.id,
        getSearchRange<Date>([date_start, date_end])
      );

      const mayorToInitSaldo =
        await getInitialBalanceOfTheFiscalYearToDateRange(
          fiscalYear?.id,
          account?.id,
          date_start
        );

      if (!mayors.length && !mayorToInitSaldo)
        responseError(
          res,
          "No hay valores de comprobantes para el rango espesificado.",
          416
        );

      if (mayorToInitSaldo) {
        mayorToInitSaldo.init_saldo = true;
        mayors.unshift(mayorToInitSaldo);
      }

      const data = this.generateMayorReportData(
        account?.code,
        account?.description,
        profile,
        mayors
      );

      const compiledTemplate = pug.compileFile(this.templatePath);
      const htmlContent = compiledTemplate(data);
      const pdfBuffer = await this.generatePDF({ htmlContent });

      res.contentType("application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName || this.defaultFileName}"`
      );
      res.send(pdfBuffer);
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async generateBalanceAccountsReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { date_end, user }: CreateBalanceReport = req.body;
      this.templatePath = pugTemplatePath(
        "accounting/tableBalanceConfirmationAccounts"
      );
      const fileName = `Balance de comprobación de saldos_${date_end}.pdf`;
      const date = moment(date_end).toDate();

      const { profile, fiscalYear } = await getUserSectionToReport(user?.id);
      const mayorsOftheFiscalYear = await getMayorsOfTheFiscalYearUntilDate(
        fiscalYear.id,
        date
      );

      if (!mayorsOftheFiscalYear.length)
        responseError(
          res,
          "No hay valores de comprobantes para la fecha espesificado.",
          416
        );

      const lastMayors = getLastMayorInAccounts(mayorsOftheFiscalYear);
      const data = this.generateBalanceReportData(profile, date, lastMayors);

      const compiledTemplate = pug.compileFile(this.templatePath);
      const htmlContent = compiledTemplate(data);
      const pdfBuffer = await this.generatePDF({ htmlContent });

      res.contentType("application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName || this.defaultFileName}"`
      );

      res.send(pdfBuffer);
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async generateSituationStateReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { date_end, user }: CreateBalanceReport = req.body;
      this.templatePath = pugTemplatePath("accounting/situationState");
      const fileName = `Estado de Situación_${date_end || ""}.pdf`;
      const date = moment(date_end).toDate();

      const { profile, fiscalYear } = await getUserSectionToReport(user?.id);
      const mayors = await getMayorsOfTheFiscalYearUntilDate(
        fiscalYear?.id,
        date
      );

      if (!mayors.length)
        responseError(
          res,
          "No hay valores de comprobantes para la fecha espesificado.",
          416
        );

      const lastMayors = getLastMayorInAccounts(mayors);
      const data = this.generateSituationStateReportData(
        profile,
        date,
        lastMayors
      );

      const compiledTemplate = pug.compileFile(this.templatePath);
      const htmlContent = compiledTemplate(data);
      const pdfBuffer = await this.generatePDF({ htmlContent });

      res.contentType("application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName || this.defaultFileName}"`
      );
      res.send(pdfBuffer);
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async generateYieldStateReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { date_end, user }: CreateBalanceReport = req.body;
      this.templatePath = pugTemplatePath("accounting/yieldState");
      const fileName = `Estado de Rendimiento${date_end || ""}.pdf`;
      const date = moment(date_end).toDate();

      const { profile, fiscalYear } = await getUserSectionToReport(user?.id);
      const mayors = await getMayorsOfTheFiscalYearUntilDate(
        fiscalYear?.id,
        date
      );

      if (!mayors.length)
        responseError(
          res,
          "No hay valores de comprobantes para la fecha espesificado.",
          416
        );

      const lastMayors = getLastMayorInAccounts(mayors);
      const data = this.generateYieldStateReportData(profile, date, lastMayors);

      const compiledTemplate = pug.compileFile(this.templatePath);
      const htmlContent = compiledTemplate(data);
      const pdfBuffer = await this.generatePDF({ htmlContent });

      res.contentType("application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName || this.defaultFileName}"`
      );
      res.send(pdfBuffer);
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  private createVoucherSearchRanges(
    rangeDate: Date[] = [],
    rangeVouchers: number[] = []
  ): [SearchRangeType<Date>, SearchRangeType<number>] {
    const voucherSearchDate = getSearchRange<Date>(rangeDate);
    const voucherSearchNumbre = getSearchRange<number>(rangeVouchers);

    return [voucherSearchDate, voucherSearchNumbre];
  }

  private generateVoucherReportData(profile: Profile, vouchers: Voucher[]) {
    const { first_name = "", last_name = "", nit = "" } = profile || {};
    const printedDate = moment().format("DD/MM/YYYY");
    const fullName = `${first_name} ${last_name}`;

    return vouchers.map(
      ({
        number,
        description: descriptionVoucher,
        date,
        voucherDetails,
        supportDocument,
      }) => {
        const accountingDate = moment(date).format("DD/MM/YYYY");
        const { type_document, document: documentNumber } = supportDocument;
        const descriptionElement =
          type_document === "g" && supportDocument.element.description;

        const { accounting, totalDebe, totalHaber } =
          voucherDetails.reduce<AccountingVoucherType>(
            (acc, { account, debe, haber }) => {
              const { code, description } = account;
              acc.accounting.push({
                code,
                description,
                debe: debe,
                haber: haber,
              });
              acc.totalDebe += debe;
              acc.totalHaber += haber;
              return acc;
            },
            { accounting: [], totalDebe: 0, totalHaber: 0 }
          );

        return {
          fullName,
          nit,
          printedDate,
          number,
          documentNumber,
          descriptionVoucher,
          descriptionElement,
          accountingDate,
          ...this.normalizeVouchersData(totalDebe, totalHaber, accounting),
        };
      }
    );
  }

  private generateBalanceReportData(
    profile: Profile,
    dateEnd: Date,
    mayors: Mayor[]
  ) {
    const { first_name = "", last_name = "", nit = "" } = profile || {};
    const printedDate = moment().format("DD/MM/YYYY");
    const accountingDate = moment(dateEnd).format("DD/MM/YYYY");
    const fullName = `${first_name} ${last_name}`;

    const { accounting, totalDebe, totalHaber } =
      mayors.reduce<AccountingMayorType>(
        (acc, { saldo, account }) => {
          const { code, description: detail } = account;

          acc.accounting.push({
            code,
            detail,
            debe: Math.max(saldo, 0),
            haber: Math.max(-saldo, 0),
          });
          acc.totalDebe += Math.max(saldo, 0);
          acc.totalHaber += Math.max(-saldo, 0);
          return acc;
        },
        { accounting: [], totalDebe: 0, totalHaber: 0 }
      );

    return {
      fullName,
      nit,
      printedDate,
      accountingDate,
      ...this.normalizeMayorsData(totalDebe, totalHaber, accounting),
    };
  }

  private generateMayorReportData(
    code: string = "",
    description: string = "",
    profile: Profile,
    mayors: Mayor[]
  ) {
    const accountCode = `${code} - ${description.toUpperCase()}`;
    const { first_name = "", last_name = "", nit = "" } = profile || {};
    const printedDate = moment().format("DD/MM/YYYY");
    const fullName = `${first_name} ${last_name}`;

    const {
      accounting: accountingDetails,
      totalDebe,
      totalHaber,
    } = this.generateAccountingDetails(mayors);
    const accounting = this.joinMayorsSameDate(accountingDetails);

    return {
      fullName,
      nit,
      printedDate,
      accountCode,
      ...this.normalizeMayorsData(totalDebe, totalHaber, accounting),
    };
  }

  private generateSituationStateReportData(
    profile: Profile,
    date: Date,
    mayors: Mayor[]
  ) {
    const { first_name = "", last_name = "", nit = "" } = profile || {};
    const printedDate = moment().format("DD/MM/YYYY");
    const emissionDate = moment(date).format("DD/MM/YYYY");
    const fullName = `${first_name} ${last_name}`;

    const initialState: DataSituationStateReportType = this.initializeState();
    const codeDescription = this.getCodeDescription();

    const data = mayors.reduce<DataSituationStateReportType>(
      (data, { saldo, account }) =>
        this.reduceStateData(data, saldo, account?.code, codeDescription),
      initialState
    );

    const [saldoIncomes, saldoExpenses] =
      generateSaldoIncomesAndSaldoExpenses(mayors);
    const utility = calculeUtility(saldoIncomes, saldoExpenses);

    data.patrimony.patrimonio.push(
      {
        description: "Utilidad retenida",
        amount: Math.max(utility, 0),
      },
      { description: "Perdida", amount: Math.max(-utility, 0) }
    );

    data.patrimony.total = Math.abs(data.patrimony.total + utility);
    data.total = calculeNetPatrimony(
      Math.abs(data.passive.total),
      data.patrimony.total
    );

    return {
      fullName,
      nit,
      printedDate,
      emissionDate,
      ...this.normalizeStateData(data),
    };
  }

  private generateYieldStateReportData(
    profile: Profile,
    date: Date,
    mayors: Mayor[]
  ) {
    const { first_name = "", last_name = "", nit = "" } = profile || {};
    const printedDate = moment().format("DD/MM/YYYY");
    const emissionDate = moment(date).format("DD/MM/YYYY");
    const fullName = `${first_name} ${last_name}`;

    const [saldoIncomes, saldoExpenses] =
      generateSaldoIncomesAndSaldoExpenses(mayors);

    const stateInit = this.initializeYield(saldoExpenses);

    const { capitalPayments, expesesToPayments } =
      mayors.reduce<DataYieldStateReportType>(
        (data, { saldo, account }) =>
          this.reduceYieldData(data, saldo, account?.code),
        stateInit
      );

    const utilityOrLost =
      Math.abs(saldoIncomes) - saldoExpenses + capitalPayments;

    return {
      fullName,
      nit,
      printedDate,
      emissionDate,
      ...this.normalizeYieldData(
        saldoIncomes,
        saldoExpenses,
        capitalPayments,
        utilityOrLost,
        Array.from(expesesToPayments.values())
      ),
    };
  }

  private generateAccountingDetails(mayors: Mayor[]): AccountingMayorType {
    return mayors.reduce<AccountingMayorType>(
      (acc, { date, saldo, init_saldo: initSaldo, voucherDetail }) => {
        const { debe, haber } = voucherDetail;

        const mayorDetail: MayorDetailType = {
          detail: "",
          date: moment(date).format("DD/MM/YYYY"),
          debe,
          haber,
          saldo,
        };

        if (initSaldo) {
          mayorDetail.detail = "Saldo inicial";
          acc.accounting.unshift(mayorDetail);
        } else {
          mayorDetail.detail = `${"Comprobante"} No. ${
            voucherDetail.voucher.number
          }`;
          acc.accounting.push(mayorDetail);
        }
        acc.totalDebe += debe;
        acc.totalHaber += haber;

        return acc;
      },
      { accounting: [], totalDebe: 0, totalHaber: 0 }
    );
  }

  private joinMayorsSameDate(
    accountingDetails: MayorDetailType[]
  ): MayorDetailType[] {
    const accountingRemoveDuplicate = new Map<string, MayorDetailType>();
    for (const mayor of accountingDetails) {
      const { date, detail, debe, haber, saldo } = mayor;
      const mayorDetail = accountingRemoveDuplicate.get(date as string);

      if (mayorDetail) {
        const voucher = detail.replace("Comprobante No. ", ",");
        accountingRemoveDuplicate.set(date as string, {
          ...mayorDetail,
          detail: mayorDetail.detail + voucher,
          debe: mayorDetail.debe + debe,
          haber: mayorDetail.haber + haber,
          saldo: saldo,
        });
      } else {
        accountingRemoveDuplicate.set(date as string, {
          ...mayor,
          saldo,
        });
      }
    }

    return Array.from(accountingRemoveDuplicate.values());
  }

  private initializeState(): DataSituationStateReportType {
    return {
      asset: { activo: 0, banco: 0, caja: 0, total: 0 },
      passive: {
        pasivo: 0,
        lendsShortTerm: 0,
        longTerm: 0,
        lendsLongTerm: 0,
        total: 0,
      },
      patrimony: { initSaldo: 0, patrimonio: [], total: 0 },
      total: 0,
    };
  }

  private initializeYield(expenses: number): DataYieldStateReportType {
    return {
      averagePayments: expenses,
      capitalPayments: 0,
      expesesToPayments: new Map([
        ["800", { description: "Gastos de Operación", amount: 0 }],
        ["810-10", { description: "Imp. Sobre Ventas", amount: 0 }],
        ["810-20", { description: "Imp. Sobre Servicios", amount: 0 }],
        ["810-30", { description: "Imp. Por Utilz. F.T.", amount: 0 }],
        ["810-40", { description: "Imp. Otros", amount: 0 }],
      ]),
      utilityOrLost: 0,
    };
  }

  private getCodeDescription() {
    return {
      "600-20": "Incrementos de aportes del TCP",
      "600-30": "Erogaciones efectuadas por el TCP",
      "600-40": "Pago de cuotas del Imp. Sobre Ing. Pers.",
      "600-50": "Pago de la Cont. a la Seg. Social del TCP",
    };
  }

  private reduceStateData(
    data: DataSituationStateReportType,
    saldo: number,
    code: string,
    codeDescription: Record<string, string>
  ): DataSituationStateReportType {
    switch (code) {
      case "100":
      case "110":
        if (code === "100") {
          data.asset.caja += Math.abs(saldo);
        } else {
          data.asset.banco += Math.abs(saldo);
        }
        data.asset.activo += Math.abs(saldo);
        data.asset.total += Math.abs(saldo);
        break;
      case "470":
      case "520":
        if (code === "470") {
          data.passive.lendsShortTerm += saldo;
          data.passive.pasivo += saldo;
        } else {
          data.passive.lendsLongTerm += saldo;
          data.passive.longTerm += saldo;
        }
        data.passive.total += saldo;
        break;
      case "600-10":
        data.patrimony.initSaldo -= saldo;
        data.patrimony.total -= saldo;
        break;
      case "600-20":
      case "600-30":
      case "600-40":
      case "600-50":
        data.patrimony.patrimonio.push({
          description: codeDescription[code],
          amount: -saldo,
        });
        data.patrimony.total -= saldo;
        break;
      default:
        break;
    }

    return data;
  }

  private reduceYieldData(
    data: DataYieldStateReportType,
    saldo: number,
    code: string
  ): DataYieldStateReportType {
    switch (code) {
      case "820":
        data.capitalPayments += saldo;
        break;
      case "800":
      case "810-10":
      case "810-20":
      case "810-30":
      case "810-40":
        data.expesesToPayments.set(code, {
          ...data.expesesToPayments.get(code),
          amount: saldo,
        });
        break;
      default:
        break;
    }

    return data;
  }

  private normalizeVouchersData(
    debe: number,
    haber: number,
    mayors: VoucherDetailType[]
  ) {
    return {
      totalDebe: parse2Float(debe),
      totalHaber: parse2Float(haber),
      accounting: mayors.map((val) => ({
        ...val,
        debe: parse2Float(val.debe),
        haber: parse2Float(val.haber),
      })),
    };
  }

  private normalizeMayorsData(
    debe: number = 0,
    haber: number = 0,
    mayors: MayorDetailType[]
  ) {
    return {
      totalDebe: parse2Float(debe),
      totalHaber: parse2Float(haber),
      accounting: mayors.map((val) => ({
        ...val,
        debe: parse2Float(val.debe || 0),
        haber: parse2Float(val.haber || 0),
        saldo: val.saldo && parse2Float(val.saldo),
      })),
    };
  }

  private normalizeStateData(data: DataSituationStateReportType) {
    const { asset, passive, patrimony, total } = data;
    return {
      asset: {
        activo: parse2Float(asset.activo),
        caja: parse2Float(asset.caja),
        banco: parse2Float(asset.banco),
        total: parse2Float(asset.total),
      },
      passive: {
        lendsLongTerm: parse2Float(Math.abs(passive.lendsLongTerm)),
        lendsShortTerm: parse2Float(Math.abs(passive.lendsShortTerm)),
        pasivo: parse2Float(Math.abs(passive.pasivo)),
        longTerm: parse2Float(Math.abs(passive.longTerm)),
        total: parse2Float(Math.abs(passive.total)),
      },
      patrimony: {
        ...patrimony,
        initSaldo: parse2Float(patrimony.initSaldo),
        patrimonio: patrimony.patrimonio.map(({ description, amount }) => ({
          description,
          amount: parse2Float(amount),
        })),
        total: parse2Float(patrimony.total),
      },
      total: parse2Float(total),
    };
  }

  private normalizeYieldData(
    incomes: number,
    average: number,
    capital: number,
    utility: number,
    expeses: {
      description: string;
      amount: number;
    }[]
  ) {
    return {
      incomes: parse2Float(Math.abs(incomes)),
      averagePayments: parse2Float(average),
      capitalPayments: parse2Float(capital),
      utilityOrLost: parse2Float(utility),
      expeses: Array.from(expeses.values()).map(({ description, amount }) => ({
        description,
        amount: parse2Float(amount),
      })),
    };
  }
}
