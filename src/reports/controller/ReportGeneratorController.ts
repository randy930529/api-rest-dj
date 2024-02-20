import { NextFunction, Request, Response } from "express";
import * as pug from "pug";
import * as moment from "moment";
import ReportGenerator from "../../base/ReportGeneratorBase";
import { ENV } from "../../utils/settings/environment";
import {
  defaultDataArray,
  getDataToDay,
  pugTemplatePath,
  sumaArray,
  sumaTotal,
} from "../utils/utilsToReports";
import {
  DataIndexByType,
  SupportDocumentPartialType,
} from "../../utils/definitions";
import { User } from "../../entity/User";
import { SectionState } from "../../entity/SectionState";

class ReportGeneratorController extends ReportGenerator {
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

  async generateOperationsExpenseReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        year,
        month,
        token,
      }: { year: number; month: number | undefined | null; token: string } =
        req.body;

      this.templatePath = pugTemplatePath("operationsExpenseReport");
      const fileName = `Reporte_de_Gastos_de_Operaciones_${
        month ? "en_el_mes" : "mensuales"
      }.pdf`;

      const { expenseId_PD } = ENV.group;

      const getInfoReportToDataBase: SupportDocumentPartialType[] =
        await this.getInfoReportToDataBase({
          token,
          type: "g",
          year,
          month,
        });

      const expensesGenerals: SupportDocumentPartialType[] =
        getInfoReportToDataBase.filter((val) => val.is_general);

      const expensesMePD: SupportDocumentPartialType[] =
        getInfoReportToDataBase.filter(
          (val) => !val.is_general && val.group === "pd"
        );

      const expensesMeDD: SupportDocumentPartialType[] =
        getInfoReportToDataBase.filter(
          (val) => !val.is_general && val.group === "dd"
        );

      const expensesNameTb1 = defaultDataArray<string>(6, "");
      let totalsTb1 = defaultDataArray<number>(13, 0);

      const expensesNameTb2 = defaultDataArray<string>(3, "");
      let totalsTb2 = defaultDataArray<number>(10, 0);
      const expensesGeneralsForDaysTb2 = defaultDataArray<number>(31, 0);
      let nextCol = 0;

      /**
       * @param
       * egresos Egresos no incluidos a efectos de impuesto, autorizados por el MFP.
       */
      const egresos = defaultDataArray<number>(31, 0);
      const totalsExpensesOperating = defaultDataArray<number>(31, 0);
      const cashInBox = defaultDataArray<number>(31, 0);
      const cashInBank = defaultDataArray<number>(31, 0);
      const totalPaid = defaultDataArray<number>(31, 0);

      const expensesForDaysTb1: (number | string)[][] = Array.from(
        { length: 31 },
        (_, day) => {
          const expensesGeneralsRecordedToDay: SupportDocumentPartialType[] =
            expensesGenerals.filter((val) => moment(val.date).date() === day);

          const expensesMePDRecordedToDay: SupportDocumentPartialType[] =
            expensesMePD.filter((val) => moment(val.date).date() === day);

          const expensesGeneralsForDays = getDataToDay<number>(
            expensesGeneralsRecordedToDay,
            "amount",
            expenseId_PD,
            defaultDataArray<number>(7, 0)
          );

          let expensesMePDForDays = defaultDataArray<number>(6, 0);
          for (let i = 0; i < expensesMePDRecordedToDay.length; i++) {
            const document: SupportDocumentPartialType =
              expensesMePDRecordedToDay[i];

            const value = document.amount;
            const description = document.description;

            const insertIn: number = expensesNameTb1.indexOf(description);

            if (insertIn === -1) {
              expensesNameTb1[nextCol] = description;
              expensesMePDForDays[nextCol] = parseFloat(value);
              nextCol++;
            } else {
              expensesMePDForDays[insertIn] = parseFloat(value);
            }
          }

          const sliceExpensesGeneralsForDays =
            expensesGeneralsForDays.splice(-2);
          expensesGeneralsForDaysTb2[day] = sliceExpensesGeneralsForDays[1];

          const toDay: number[] = [
            ...expensesGeneralsForDays,
            ...expensesMePDForDays,
            sliceExpensesGeneralsForDays[0],
          ];

          const total: number = sumaTotal(toDay);
          toDay.push(total);
          totalsExpensesOperating[day] += total;
          totalsTb1 = sumaArray(totalsTb1, toDay);

          return toDay;
        }
      );

      nextCol = 0;
      const expensesForDaysTb2: (number | string)[][] = Array.from(
        { length: 31 },
        (_, day) => {
          const expensesMeDDRecordedToDay: SupportDocumentPartialType[] =
            expensesMeDD.filter((val) => moment(val.date).date() === day);

          let expensesMeDDForDays = defaultDataArray<number>(3, 0);
          for (let i = 0; i < expensesMeDDRecordedToDay.length; i++) {
            const document: SupportDocumentPartialType =
              expensesMeDDRecordedToDay[i];

            const value = document.amount;
            const description = document.description;

            const insertIn: number = expensesNameTb2.indexOf(
              document.description
            );

            if (insertIn === -1) {
              expensesNameTb1[nextCol] = description;
              expensesMeDDForDays[nextCol] = parseFloat(value);
              nextCol++;
            } else {
              expensesMeDDForDays[insertIn] = parseFloat(value);
            }
          }

          const toDay: number[] = [
            expensesGeneralsForDaysTb2[day],
            ...expensesMeDDForDays,
          ];

          const total: number = sumaTotal(toDay);
          const sumaTotalEgresos = total + egresos[day];
          totalsExpensesOperating[day] += sumaTotalEgresos;
          const sumacashInBoxAndBank = cashInBox[day] + cashInBank[day];
          totalPaid[day] += sumacashInBoxAndBank;
          toDay.push(total);
          toDay.push(egresos[day]);
          toDay.push(totalsExpensesOperating[day]);
          toDay.push(cashInBox[day]);
          toDay.push(cashInBank[day]);
          toDay.push(totalPaid[day]);
          totalsTb2 = sumaArray(totalsTb2, toDay);

          return [...toDay, ""];
        }
      );

      const compiledTemplate = pug.compileFile(this.templatePath);

      const dataMatrix: (number | string)[][][] = [
        expensesForDaysTb1,
        expensesForDaysTb2,
      ];
      const dataTotals: number[][] = [totalsTb1, totalsTb2];
      const expensesName: string[][] = [expensesNameTb1, expensesNameTb2];

      const htmlContent = compiledTemplate({
        dataMatrix,
        dataTotals,
        expensesName,
      });
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

  async generateOperationsIncomeReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        month,
        token,
        user,
      }: { month: number | undefined | null; token: string; user: User } =
        req.body;

      this.templatePath = pugTemplatePath("income/operationsIncomeReport");
      const fileName = `Reporte_de_Operaciones_de_Ingresos_${
        month ? `en_el_mes_${month}` : "anual"
      }.pdf`;

      const { fiscalYear } = await SectionState.findOne({
        relations: ["fiscalYear"],
        select: { fiscalYear: { year: true } },
        where: { user: { id: user.id } },
      });

      const { year } = fiscalYear;

      const getInfoReportToDataBase = await this.getInfoReportToDataBase({
        token,
        type: "i",
        year,
        month,
      });

      const incomeMeEI = getInfoReportToDataBase.filter(
        (val) => val.group === "ei"
      );

      const incomeMeIG = getInfoReportToDataBase.filter(
        (val) => val.group === "ig"
      );

      let totals = defaultDataArray<number>(4, 0);

      const incomeForDays: (number | string)[][] = Array.from(
        { length: 31 },
        (_, day) => {
          const incomeMeEIRecordedToDay: SupportDocumentPartialType[] =
            incomeMeEI.filter((val) => moment(val.date).date() === day);

          const incomeMeIGRecordedToDay: SupportDocumentPartialType[] =
            incomeMeIG.filter((val) => moment(val.date).date() === day);

          const toDay = defaultDataArray<number>(3, 0);

          if (incomeMeEIRecordedToDay.length)
            toDay[1] = parseFloat(incomeMeEIRecordedToDay[0].amount);

          if (incomeMeIGRecordedToDay.length)
            toDay[2] = parseFloat(incomeMeIGRecordedToDay[0].amount);

          const total: number = sumaTotal(toDay);
          toDay.push(total);
          toDay[0] = total;
          totals = sumaArray(totals, toDay);

          return [...toDay, ""];
        }
      );

      const compiledTemplate = pug.compileFile(this.templatePath);

      const htmlContent = compiledTemplate({
        data: incomeForDays,
        totals,
        monthIndex: month,
      });
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

  async generateOperationsIncomeReportAnnual(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token, user }: { token: string; user: User } = req.body;

      this.templatePath = pugTemplatePath(
        "income/operationsIncomeReportAnnual"
      );
      const fileName = `Reporte_de_Operaciones_de_Ingresos_anual.pdf`;

      const { fiscalYear } = await SectionState.findOne({
        relations: ["fiscalYear"],
        select: { fiscalYear: { year: true } },
        where: { user: { id: user.id } },
      });

      const { year } = fiscalYear;

      const infoReportToDataBase = await this.getInfoReportToDataBase({
        token,
        type: "i",
        year,
      });

      const dataMonths: DataIndexByType = defaultDataArray<number[][]>(
        12,
        defaultDataArray<number[]>(31, defaultDataArray<number>(4, 0))
      );

      const totalMonths = defaultDataArray<number[]>(
        12,
        defaultDataArray<number>(4, 0)
      );

      let totals = defaultDataArray<number>(4, 0);

      for (let i = 0; i < infoReportToDataBase.length; i++) {
        const { month, date, group, amount } = infoReportToDataBase[i];

        const index: number = parseInt(month) - 1;
        const day: number = moment(date).date();
        const indexGroup: number = group === "ei" ? 1 : 2;

        const toDay = [...dataMonths[index][day]].slice(0, -1);
        toDay[indexGroup] = parseFloat(amount);
        const total: number = sumaTotal(toDay);
        toDay.push(total);

        let updatedTotalMonths = [...totalMonths[index]];
        updatedTotalMonths = sumaArray(updatedTotalMonths, toDay);

        totalMonths[index] = updatedTotalMonths;
        totals = sumaArray(totals, toDay);

        const updatedDataMonths = [...dataMonths[index]];
        updatedDataMonths[day] = toDay;
        dataMonths[index] = updatedDataMonths;
      }

      const compiledTemplate = pug.compileFile(this.templatePath);

      const htmlContent = compiledTemplate({
        dataMonths,
        totalMonths,
        totals,
      });
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
}

export default ReportGeneratorController;
