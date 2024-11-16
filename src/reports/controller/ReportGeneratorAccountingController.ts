import { NextFunction, Request, Response } from "express";
import { Between, LessThanOrEqual } from "typeorm";
import * as pug from "pug";
import * as moment from "moment";
import ReportGenerator from "../../base/ReportGeneratorBase";
import { responseError } from "../../errors/responseError";
import { SectionState } from "../../entity/SectionState";
import { Voucher } from "../../entity/Voucher";
import { Mayor } from "../../entity/Mayor";
import { CreateVoucherReport } from "../dto/request/createVoucherReport.dto";
import { CreateMayorReport } from "../dto/request/createMayorReport.dto";
import { CreateBalanceReport } from "../dto/request/createBalanceReport.dto";
import { pugTemplatePath } from "../utils/utilsToReports";
import {
  AccountingMayorType,
  AccountingVoucherType,
  DataSituationStateReportType,
  DataVoucherReportType,
  DataYieldStateReportType,
  MayorDetailType,
} from "../../utils/definitions";
import {
  VOUCHER_RELATIONS,
  VOUCHER_SELECT,
} from "../utils/query/vouchers.fetch";
import {
  SECTION_RELATIONS,
  SECTION_SELECT,
} from "../utils/query/voucherReportSection.fetch";
import {
  MAYOR_ACCOUNT_ORDER,
  MAYOR_ACCOUNT_RELATIONS,
  MAYOR_ACCOUNT_SELECT,
  MAYOR_ORDER,
  MAYOR_RELATIONS,
  MAYOR_SELECT,
} from "../utils/query/mayor.fetch";
import {
  STATE_ACCOUNT_ORDER,
  STATE_ACCOUNT_RELATIONS,
  STATE_ACCOUNT_SELECT,
} from "../utils/query/mayorAccount.fetch";

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

      const SECTION_WHERE = { user: { id: user?.id } };
      const { profile, fiscalYear } = await SectionState.findOne({
        select: SECTION_SELECT,
        relations: SECTION_RELATIONS,
        where: SECTION_WHERE,
      });

      const [date_start, date_end] = rangeDate || [];
      const voucherDateWhere = date_end
        ? {
            date: Between(date_start, date_end),
          }
        : {
            date: date_start,
          };

      const [voucher_start, voucher_end] = rangeVouchers || [];
      const voucherNumbreWhere = voucher_end
        ? {
            number: Between(voucher_start, voucher_end),
          }
        : {
            number: voucher_start,
          };

      const VOUCHER_WHERE = {
        supportDocument: { fiscalYear: { id: fiscalYear?.id } },
        date: voucherDateWhere.date,
        number: voucherNumbreWhere.number,
      };
      const vouchers = await Voucher.find({
        select: VOUCHER_SELECT,
        relations: VOUCHER_RELATIONS,
        where: VOUCHER_WHERE,
        order: { number: "ASC" },
      });

      if (!vouchers.length)
        responseError(
          res,
          "No hay valores de comprobantes para el rango espesificado.",
          404
        );

      const { first_name = "", last_name = "", nit = "" } = profile || {};
      const printedDate = moment().format("DD/MM/YYYY");
      const fullName = `${first_name} ${last_name}`;

      const data = vouchers.map<DataVoucherReportType>(
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
            accounting,
            totalDebe,
            totalHaber,
          };
        }
      );

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

  async generateBiggerReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { date_start, date_end, account, user }: CreateMayorReport =
        req.body;
      const { id: accountId, code, description } = account;
      this.templatePath = pugTemplatePath("accounting/tableBigger");
      const fileName = `Mayor de Cuenta_${code}-${description}-[${[
        date_start,
        date_end,
      ]}].pdf`;

      const { profile, fiscalYear } = await SectionState.findOne({
        select: SECTION_SELECT,
        relations: SECTION_RELATIONS,
        where: { user: { id: user?.id } },
      });

      const MAYOR_WHERE = {
        fiscalYear: { id: fiscalYear.id },
        account: { id: accountId },
        date: Between(date_start, date_end),
      };
      const biggers = await Mayor.find({
        select: MAYOR_SELECT,
        relations: MAYOR_RELATIONS,
        where: MAYOR_WHERE,
        order: MAYOR_ORDER,
      });

      if (!biggers.length)
        responseError(
          res,
          "No hay valores de comprobantes para el rango espesificado.",
          404
        );

      const accountCode = `${code} - ${description?.toUpperCase()}`;
      const { first_name = "", last_name = "", nit = "" } = profile || {};
      const printedDate = moment().format("DD/MM/YYYY");
      const fullName = `${first_name} ${last_name}`;

      const {
        accounting: accountingDetails,
        totalDebe,
        totalHaber,
      } = biggers.reduce<AccountingMayorType>(
        (acc, { date, saldo, is_reference, voucherDetail }) => {
          const { debe, haber } = voucherDetail;

          const mayorDetail: MayorDetailType = {
            detail: "",
            date: moment(date).format("DD/MM/YYYY"),
            debe,
            haber,
            saldo,
          };

          if (is_reference) {
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

      const accountingRemoveDuplicate = new Map<string, MayorDetailType>();
      for (const mayor of accountingDetails) {
        const mayorDetail = accountingRemoveDuplicate.get(mayor.date as string);
        if (mayorDetail) {
          const voucher = mayor.detail.replace("Comprobante No. ", ",");
          accountingRemoveDuplicate.set(mayor.date as string, {
            ...mayorDetail,
            detail: mayorDetail.detail + voucher,
            debe: mayorDetail.debe + mayor.debe,
            haber: mayorDetail.haber + mayor.haber,
            saldo: mayor.saldo,
          });
        } else {
          accountingRemoveDuplicate.set(mayor.date as string, mayor);
        }
      }
      const accounting = Array.from(accountingRemoveDuplicate.values());

      const data = {
        fullName,
        nit,
        printedDate,
        accountCode,
        accounting,
        totalDebe,
        totalHaber,
      };

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

  async generateBalanceConfirmationAccountsReport(
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

      const SECTION_WHERE = { user: { id: user?.id } };
      const { profile, fiscalYear } = await SectionState.findOne({
        select: SECTION_SELECT,
        relations: SECTION_RELATIONS,
        where: SECTION_WHERE,
      });

      const MAYOR_WHERE = {
        fiscalYear: { id: fiscalYear.id },
        date: LessThanOrEqual(date_end),
      };
      const yearBiggers = await Mayor.find({
        select: MAYOR_ACCOUNT_SELECT,
        relations: MAYOR_ACCOUNT_RELATIONS,
        where: MAYOR_WHERE,
        order: MAYOR_ACCOUNT_ORDER,
      });

      if (!yearBiggers.length)
        responseError(
          res,
          "No hay valores de comprobantes para la fecha espesificado.",
          404
        );

      const accountsBigger = Object.values(
        yearBiggers.reduce<{ [key: string]: Mayor }>((acc, val) => {
          if (!acc[val.account.code]) {
            acc[val.account.code] = val;
          }
          return acc;
        }, {})
      );

      const { first_name = "", last_name = "", nit = "" } = profile || {};
      const printedDate = moment().format("DD/MM/YYYY");
      const accountingDate = moment(date_end).format("DD/MM/YYYY");
      const fullName = `${first_name} ${last_name}`;

      const { accounting, totalDebe, totalHaber } =
        accountsBigger.reduce<AccountingMayorType>(
          (acc, { saldo, account }) => {
            const { code, description: detail } = account;

            acc.accounting.push({
              code,
              detail,
              debe: saldo > 0 ? saldo : 0,
              haber: saldo < 0 ? saldo * -1 : 0,
            });
            acc.totalDebe += saldo > 0 ? saldo : 0;
            acc.totalHaber += saldo < 0 ? saldo * -1 : 0;
            return acc;
          },
          { accounting: [], totalDebe: 0, totalHaber: 0 }
        );

      const data = {
        fullName,
        nit,
        printedDate,
        accountingDate,
        totalDebe,
        totalHaber,
        accounting,
      };

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

      const SECTION_WHERE = { user: { id: user?.id } };
      const { profile, fiscalYear } = await SectionState.findOne({
        select: SECTION_SELECT,
        relations: SECTION_RELATIONS,
        where: SECTION_WHERE,
      });

      const MAYOR_WHERE = {
        fiscalYear: { id: fiscalYear.id },
        date: LessThanOrEqual(date),
      };
      const yearBiggers = await Mayor.find({
        select: STATE_ACCOUNT_SELECT,
        relations: STATE_ACCOUNT_RELATIONS,
        where: MAYOR_WHERE,
        order: STATE_ACCOUNT_ORDER,
      });

      if (!yearBiggers.length)
        responseError(
          res,
          "No hay valores de comprobantes para la fecha espesificado.",
          404
        );

      const accountsBigger = Object.values(
        yearBiggers.reduce<{ [key: string]: Mayor }>((acc, val) => {
          if (!acc[val.account.code]) {
            acc[val.account.code] = val;
          }
          return acc;
        }, {})
      );

      const { first_name = "", last_name = "", nit = "" } = profile || {};
      const printedDate = moment().format("DD/MM/YYYY");
      const emissionDate = moment(date_end).format("DD/MM/YYYY");
      const fullName = `${first_name} ${last_name}`;

      const stateInit: DataSituationStateReportType = {
        asset: {
          activo: 0,
          banco: 0,
          caja: 0,
          total: 0,
        },
        passive: {
          pasivo: 0,
          lendsShortTerm: 0,
          longTerm: 0,
          lendsLongTerm: 0,
          total: 0,
        },
        patrimony: {
          initSaldo: 0,
          patrimonio: [],
          total: 0,
        },
        total: 0,
      };
      const codeDescription = {
        "600-20": "Incrementos de aportes del TCP",
        "600-30": "Erogaciones efectuadas por el TCP",
        "600-40": "Pago de cuotas del Imp. Sobre Ing. Pers.",
        "600-50": "Pago de la Cont. a la Seg. Social del TCP",
      };
      const { asset, passive, patrimony } =
        accountsBigger.reduce<DataSituationStateReportType>(
          (acc, { saldo, account }) => {
            switch (account?.code) {
              case "100":
                acc.asset.caja += saldo;
              case "110":
                acc.asset.banco += saldo;
              case "100":
              case "110":
                acc.asset.activo += saldo;
                acc.asset.total += saldo;
                break;
              case "470":
                acc.passive.lendsShortTerm += saldo;
                acc.passive.pasivo += saldo;
              case "520":
                acc.passive.lendsLongTerm += saldo;
                acc.passive.longTerm += saldo;
              case "520":
              case "470":
                acc.passive.total += saldo;
                break;
              case "600-10":
                acc.patrimony.initSaldo += saldo * -1;
                acc.patrimony.total += saldo * -1;
                break;
              case "600-20":
              case "600-30":
              case "600-40":
              case "600-50":
                acc.patrimony.patrimonio.push({
                  description: codeDescription[account.code],
                  amount: saldo * -1,
                });
                acc.patrimony.total += saldo * -1;
                break;
              default:
                break;
            }

            return acc;
          },
          stateInit
        );

      passive.lendsLongTerm = Math.abs(passive.lendsLongTerm);
      passive.lendsShortTerm = Math.abs(passive.lendsShortTerm);
      passive.pasivo = Math.abs(passive.pasivo);
      passive.longTerm = Math.abs(passive.longTerm);
      passive.total = Math.abs(passive.total);
      const saldoAccount900 = this.saldoTotalInAccount900(accountsBigger);
      const saldoAccountsExpenses =
        this.saldoTotalInAccountExpense(accountsBigger);

      const utility = Math.abs(saldoAccount900) - saldoAccountsExpenses;
      patrimony.patrimonio.push(
        ...[
          {
            description: "Utilidad retenida",
            amount: utility > 0 ? utility : 0,
          },
          { description: "Perdida", amount: utility < 0 ? utility * -1 : 0 },
        ]
      );

      const total = passive.total + patrimony.total + utility;

      patrimony.total = Math.abs(patrimony.total);
      asset.caja = Math.abs(asset.caja);
      asset.banco = Math.abs(asset.banco);

      const data = {
        fullName,
        nit,
        printedDate,
        emissionDate,
        asset,
        passive,
        patrimony,
        total,
      };

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

      const SECTION_WHERE = { user: { id: user?.id } };
      const { profile, fiscalYear } = await SectionState.findOne({
        select: SECTION_SELECT,
        relations: SECTION_RELATIONS,
        where: SECTION_WHERE,
      });

      const MAYOR_WHERE = {
        fiscalYear: { id: fiscalYear.id },
        date: LessThanOrEqual(date),
      };
      const yearBiggers = await Mayor.find({
        select: STATE_ACCOUNT_SELECT,
        relations: STATE_ACCOUNT_RELATIONS,
        where: MAYOR_WHERE,
        order: STATE_ACCOUNT_ORDER,
      });

      if (!yearBiggers.length)
        responseError(
          res,
          "No hay valores de comprobantes para la fecha espesificado.",
          404
        );

      const accountsBigger = Object.values(
        yearBiggers.reduce<{ [key: string]: Mayor }>((acc, val) => {
          if (!acc[val.account.code]) {
            acc[val.account.code] = val;
          }
          return acc;
        }, {})
      );

      const { first_name = "", last_name = "", nit = "" } = profile || {};
      const printedDate = moment().format("DD/MM/YYYY");
      const emissionDate = moment(date_end).format("DD/MM/YYYY");
      const fullName = `${first_name} ${last_name}`;

      const incomes = this.saldoTotalInAccount900(accountsBigger);

      const stateInit: DataYieldStateReportType = {
        averagePayments: this.saldoTotalInAccountExpense(accountsBigger),
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

      const { averagePayments, capitalPayments, expesesToPayments } =
        accountsBigger.reduce<DataYieldStateReportType>(
          (acc, { saldo, account }) => {
            const code = account?.code;

            switch (code) {
              case "820":
                // acc.averagePayments += saldo;
                acc.capitalPayments += saldo;
                break;
              case "810":
              case "800":
              // acc.averagePayments += saldo;
              case "800":
              case "810-10":
              case "810-20":
              case "810-30":
              case "810-40":
                acc.expesesToPayments.set(code, {
                  ...acc.expesesToPayments.get(code),
                  amount: saldo,
                });
                break;
              default:
                break;
            }

            return acc;
          },
          stateInit
        );

      const utilityOrLost =
        Math.abs(incomes) - averagePayments + capitalPayments;
      const expeses = Array.from(expesesToPayments.values());

      const data = {
        fullName,
        nit,
        printedDate,
        emissionDate,
        incomes,
        averagePayments,
        capitalPayments,
        utilityOrLost,
        expeses,
      };

      data.incomes = Math.abs(data.incomes);

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

  private saldoTotalInAccount900(accountsBigger: Mayor[]): number {
    return accountsBigger.reduce((saldoTotal, { saldo, account }) => {
      return account?.code.startsWith("900") ? saldoTotal + saldo : saldoTotal;
    }, 0);
  }

  private saldoTotalInAccountExpense(accountsBigger: Mayor[]): number {
    return accountsBigger.reduce((saldoTotal, { saldo, account }) => {
      return account?.code.startsWith("810") ||
        ["800", "820"].indexOf(account?.code) !== -1
        ? saldoTotal + saldo
        : saldoTotal;
    }, 0);
  }
}
