import { NextFunction, Request, Response } from "express";
import * as pug from "pug";
import * as moment from "moment";
import ReportGenerator from "../../base/ReportGeneratorBase";
import { splitArrayIntoParts } from "../../utils/splitArrayIntoParts";
import { SupportDocument } from "../../entity/SupportDocument";
import { ENV } from "../../utils/settings/environment";
import {
  defaultDataArray,
  getDataToDay,
  pugTemplatePath,
  sumaArray,
  sumaTotal,
} from "../utils/utilsToReports";

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
        month,
        token,
      }: { month: number | undefined | null; token: string } = req.body;

      this.templatePath = pugTemplatePath("operationsExpenseReport");
      const fileName = `Reporte_de_Gastos_de_Operaciones_${
        month ? "en_el_mes" : "mensuales"
      }.pdf`;

      const { expenseId_PD } = ENV.group;

      const getInfoReportToDataBase: SupportDocument[] =
        await this.getInfoReportToDataBase({
          token,
          type: "g",
          month,
        });

      const expensesGenerals: SupportDocument[] =
        getInfoReportToDataBase.filter((val) => val.element.is_general);

      const expensesMePD: SupportDocument[] = getInfoReportToDataBase.filter(
        (val) => !val.element.is_general && val.element.group === "pd"
      );

      const expensesMeDD: SupportDocument[] = getInfoReportToDataBase.filter(
        (val) => !val.element.is_general && val.element.group === "dd"
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
          const expensesGeneralsRecordedToDay: SupportDocument[] =
            expensesGenerals.filter((val) => moment(val.date).date() === day);

          const expensesMePDRecordedToDay: SupportDocument[] =
            expensesMePD.filter((val) => moment(val.date).date() === day);

          const expensesGeneralsForDays = getDataToDay<number>(
            expensesGeneralsRecordedToDay,
            "amount",
            expenseId_PD,
            defaultDataArray<number>(7, 0)
          );

          let expensesMePDForDays = defaultDataArray<number>(6, 0);
          for (let i = 0; i < expensesMePDRecordedToDay.length; i++) {
            const document: SupportDocument = expensesMePDRecordedToDay[i];

            const value = document.amount;
            const description = document.element.description;

            const insertIn: number = expensesNameTb1.indexOf(description);

            if (insertIn === -1) {
              expensesNameTb1[nextCol] = description;
              expensesMePDForDays[nextCol] = value;
              nextCol++;
            } else {
              expensesMePDForDays[insertIn] = value;
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
          const expensesMeDDRecordedToDay: SupportDocument[] =
            expensesMeDD.filter((val) => moment(val.date).date() === day);

          let expensesMeDDForDays = defaultDataArray<number>(3, 0);
          for (let i = 0; i < expensesMeDDRecordedToDay.length; i++) {
            const document: SupportDocument = expensesMeDDRecordedToDay[i];

            const value = document.amount;
            const description = document.element.description;

            const insertIn: number = expensesNameTb2.indexOf(
              document.element.description
            );

            if (insertIn === -1) {
              expensesNameTb1[nextCol] = description;
              expensesMeDDForDays[nextCol] = value;
              nextCol++;
            } else {
              expensesMeDDForDays[insertIn] = value;
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
      this.templatePath = pugTemplatePath("operationsIncomeReport");
      const token = req.headers.authorization.split(" ")[1];

      const getInfoReportToDataBase = await this.getInfoReportToDataBase({
        token,
        type: "i",
      });

      const matrix = splitArrayIntoParts<SupportDocument>(
        getInfoReportToDataBase,
        6
      );

      console.log(getInfoReportToDataBase, matrix);

      const compiledTemplate = pug.compileFile(this.templatePath);
      const data = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ];

      const totals = [0, 0, 0, 0, 0];

      res.send(compiledTemplate({ data, totals }));
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}

export default ReportGeneratorController;
