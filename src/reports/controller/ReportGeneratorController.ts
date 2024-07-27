import { NextFunction, Request, Response } from "express";
import { FindOptionsSelect } from "typeorm";
import * as pug from "pug";
import * as moment from "moment";
import ReportGenerator from "../../base/ReportGeneratorBase";
import { User } from "../../entity/User";
import { SectionState } from "../../entity/SectionState";
import { Dj08SectionData, SectionName } from "../../entity/Dj08SectionData";
import {
  calculeMoraDays,
  clearDuplicatesInArray,
  defaultDataArray,
  getDataAndTotalsToDj08Sections,
  getDataExpensesInToMonthArrayToTables,
  getDataToDay,
  pugTemplatePath,
  sumaArray,
  sumaTotal,
} from "../utils/utilsToReports";

import {
  DataIndexByType,
  DataSectionAType,
  DataSectionBType,
  DataSectionGType,
  DataSectionHType,
  DataSectionIType,
  SupportDocumentPartialType,
  TotalSectionAType,
  TotalSectionGType,
  TotalSectionIType,
} from "../../utils/definitions";
import { appConfig } from "../../../config";

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
      const { month, user }: { month: number | undefined | null; user: User } =
        req.body;

      this.templatePath = pugTemplatePath("expense/operationsExpenseReport");
      const fileName = `Reporte_de_Gastos_de_Operaciones_${
        month ? `en_el_mes-${month}` : "mensuales"
      }.pdf`;

      const { expensePD } = appConfig.group;

      const getInfoReportToDataBase: SupportDocumentPartialType[] =
        await this.getInfoReportToDataBase({
          userId: user.id,
          type: "g",
          month,
        });

      const expensesGenerals: SupportDocumentPartialType[] =
        getInfoReportToDataBase.filter((val) => val.is_general);

      const expensesMePD: SupportDocumentPartialType[] =
        getInfoReportToDataBase.filter(
          (val) => !val.is_general && val.group?.trim() === "pdgt"
        );

      const expensesMeDD: SupportDocumentPartialType[] =
        getInfoReportToDataBase.filter(
          (val) => !val.is_general && val.group?.trim() === "ddgt"
        );

      const expensesMeNIEI: SupportDocumentPartialType[] =
        getInfoReportToDataBase.filter(
          (val) => val.is_general && val.group?.trim() === "niei"
        );

      const expensesNameTb1 = defaultDataArray<string>(6, "");
      let totalsTb1 = defaultDataArray<number>(13, 0);

      const expensesNameTb2 = defaultDataArray<string>(3, "");
      let totalsTb2 = defaultDataArray<number>(10, 0);
      const expensesGeneralsForDaysTb2 = defaultDataArray<number>(31, 0);
      let nextCol = 0;

      const totalsExpensesOperating = defaultDataArray<number>(31, 0);
      const cashInBox = defaultDataArray<number>(31, 0);
      const cashInBank = defaultDataArray<number>(31, 0);
      const totalPaid = defaultDataArray<number>(31, 0);

      const expensesForDaysTb1: (number | string)[][] = Array.from(
        { length: 31 },
        (_, day) => {
          const expensesGeneralsRecordedToDay: SupportDocumentPartialType[] =
            expensesGenerals.filter(
              (val) => moment(val.date).date() === day + 1
            );

          const expensesMePDRecordedToDay: SupportDocumentPartialType[] =
            expensesMePD.filter((val) => moment(val.date).date() === day + 1);

          const expensesGeneralsForDays = getDataToDay(
            expensesGeneralsRecordedToDay,
            "amount",
            expensePD,
            defaultDataArray<number>(7, 0),
            cashInBank[day],
            cashInBox[day]
          );

          if (expensesGeneralsRecordedToDay.length) {
            cashInBox[day] += expensesGeneralsForDays.pop();
            cashInBank[day] += expensesGeneralsForDays.pop();
          }

          let expensesMePDForDays = defaultDataArray<number>(6, 0);
          for (let i = 0; i < expensesMePDRecordedToDay.length; i++) {
            const document: SupportDocumentPartialType =
              expensesMePDRecordedToDay[i];

            const value = parseFloat(document.amount);
            const description = document.description;

            const insertIn: number = expensesNameTb1.indexOf(description);
            document.is_bank
              ? (cashInBank[day] += value)
              : (cashInBox[day] += value);

            if (insertIn === -1) {
              expensesNameTb1[nextCol] = description;
              expensesMePDForDays[nextCol] += value;
              nextCol++;
            } else {
              expensesMePDForDays[insertIn] += value;
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
            expensesMeDD.filter((val) => moment(val.date).date() === day + 1);

          const expensesMeNIEIRecordedToDay: SupportDocumentPartialType[] =
            expensesMeNIEI.filter((val) => moment(val.date).date() === day + 1);

          let expensesMeDDForDays = defaultDataArray<number>(3, 0);
          for (let i = 0; i < expensesMeDDRecordedToDay.length; i++) {
            const document: SupportDocumentPartialType =
              expensesMeDDRecordedToDay[i];

            const value = parseFloat(document.amount);
            const description = document.description;

            const insertIn: number = expensesNameTb2.indexOf(description);
            document.is_bank
              ? (cashInBank[day] += value)
              : (cashInBox[day] += value);

            if (insertIn === -1) {
              expensesNameTb2[nextCol] = description;
              expensesMeDDForDays[nextCol] += value;
              nextCol++;
            } else {
              expensesMeDDForDays[insertIn] += value;
            }
          }

          const { egresos } = expensesMeNIEIRecordedToDay.reduce(
            (sumaTotals, val) => {
              sumaTotals.egresos += parseFloat(val.amount);
              val.is_bank
                ? (sumaTotals.sumaCashInBank += parseFloat(val.amount))
                : (sumaTotals.sumeCashInBox += parseFloat(val.amount));
              return sumaTotals;
            },
            { egresos: 0, sumaCashInBank: 0, sumeCashInBox: 0 }
          );

          const toDay: number[] = [
            expensesGeneralsForDaysTb2[day],
            ...expensesMeDDForDays,
          ];

          const total: number = sumaTotal(toDay);
          const sumaTotalEgresos = total + egresos;
          totalsExpensesOperating[day] += sumaTotalEgresos;
          const sumacashInBoxAndBank = cashInBox[day] + cashInBank[day];
          totalPaid[day] += sumacashInBoxAndBank;
          toDay.push(total);
          toDay.push(egresos);
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

  async generateOperationsIncomeReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { month, user }: { month: number | undefined | null; user: User } =
        req.body;

      this.templatePath = pugTemplatePath("income/operationsIncomeReport");
      const fileName = `Reporte_de_Operaciones_de_Ingresos_${
        month ? `en_el_mes_${month}` : "mensuales"
      }.pdf`;

      const getInfoReportToDataBase = await this.getInfoReportToDataBase({
        userId: user?.id,
        type: "i",
        month,
      });

      const incomeMeEI = getInfoReportToDataBase.filter(
        (val) => val.group?.trim() === "igex"
      );

      const incomeMeIG = getInfoReportToDataBase.filter(
        (val) => val.group?.trim() === "iggv"
      );

      let totals = defaultDataArray<number>(5, 0);

      const incomeForDays: (number | string)[][] = Array.from(
        { length: 31 },
        (_, day) => {
          const incomeMeEIRecordedToDay: SupportDocumentPartialType[] =
            incomeMeEI.filter((val) => moment(val.date).date() === day + 1);

          const incomeMeIGRecordedToDay: SupportDocumentPartialType[] =
            incomeMeIG.filter((val) => moment(val.date).date() === day + 1);

          const toDay = defaultDataArray<number>(4, 0);

          incomeMeEIRecordedToDay?.reduce(
            (acc, val) => {
              acc.suma += parseFloat(val.amount);
              val.is_bank
                ? (acc.bank += parseFloat(val.amount))
                : (acc.box += parseFloat(val.amount));

              toDay[0] = acc.box;
              toDay[1] = acc.bank;
              toDay[2] = acc.suma;
              return acc;
            },
            { suma: 0, box: 0, bank: 0 }
          );

          incomeMeIGRecordedToDay?.reduce(
            (acc, val) => {
              acc.suma += parseFloat(val.amount);
              val.is_bank
                ? (acc.bank += parseFloat(val.amount))
                : (acc.box += parseFloat(val.amount));

              toDay[0] = acc.box;
              toDay[1] = acc.bank;
              toDay[3] = acc.suma;
              return acc;
            },
            { suma: 0, box: toDay[0], bank: toDay[1] }
          );

          const total: number = sumaTotal(toDay.slice(2));
          toDay.push(total);
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
      const { user }: { token: string; user: User } = req.body;

      this.templatePath = pugTemplatePath(
        "income/operationsIncomeReportAnnual"
      );
      const fileName = `Reporte_de_Operaciones_de_Ingresos_anual.pdf`;

      const infoReportToDataBase = await this.getInfoReportToDataBase({
        userId: user.id,
        type: "i",
      });

      const dataMonths: DataIndexByType = defaultDataArray<number[][]>(
        12,
        defaultDataArray<number[]>(31, defaultDataArray<number>(5, 0))
      );

      const totalMonths = defaultDataArray<number[]>(
        12,
        defaultDataArray<number>(5, 0)
      );

      let totals = defaultDataArray<number>(5, 0);

      for (let i = 0; i < infoReportToDataBase.length; i++) {
        const { month, date, is_bank, group, amount } = infoReportToDataBase[i];

        const index: number = parseInt(month) - 1;
        const day: number = moment(date).date() - 1;
        const indexGroup: number = group?.trim() === "igex" ? 2 : 3;
        const indexBoxOrBank: number = is_bank ? 1 : 0;

        const toDay = [...dataMonths[index][day]].slice(0, -1);
        toDay[indexGroup] = parseFloat(amount);
        toDay[indexBoxOrBank] = parseFloat(amount);
        const total: number = sumaTotal(toDay.slice(2));
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

  async generateOperationsExpenseReportAnnual(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user }: { token: string; user: User } = req.body;

      this.templatePath = pugTemplatePath(
        "expense/operationsExpenseReportAnnual"
      );
      const fileName = `Reporte_de_Operaciones_de_Ingresos_anual.pdf`;

      const infoReportToDataBase = await this.getInfoReportToDataBase({
        userId: user.id,
        type: "g",
      });

      const dataMonths = <DataIndexByType>{};

      const expensesName: {
        [key: number]: {
          tb1: string[];
          tb2: string[];
        };
      } = {};

      const allExpensesName: {
        tb1: string[];
        tb2: string[];
      } = {
        tb1: defaultDataArray<string>(6, ""),
        tb2: defaultDataArray<string>(3, ""),
      };

      const totalMonths: {
        [key: number]: (string | number)[][];
      } = {};

      let totals: {
        tb1: (string | number)[];
        tb2: (string | number)[];
      } = {
        tb1: defaultDataArray<number>(13, 0),
        tb2: defaultDataArray<number>(10, 0),
      };

      for (let i = 1; i <= 12; i++) {
        const expensesGenerals = infoReportToDataBase.filter(
          (val) => val.is_general && i === parseInt(val.month)
        );

        const expensesMePD = infoReportToDataBase.filter(
          (val) =>
            !val.is_general &&
            val.group?.trim() === "pdgt" &&
            i === parseInt(val.month)
        );

        const expensesMeDD = infoReportToDataBase.filter(
          (val) =>
            !val.is_general &&
            val.group?.trim() === "ddgt" &&
            i === parseInt(val.month)
        );

        const [dataTb1, dataTb2, displayName, totalMonth] =
          getDataExpensesInToMonthArrayToTables(
            expensesGenerals,
            expensesMePD,
            expensesMeDD
          );

        dataMonths[i] = [dataTb1, dataTb2];

        const tb1 = displayName[0] as string[];
        const tb2 = displayName[1] as string[];
        expensesName[i] = { tb1, tb2 };

        allExpensesName.tb1 = clearDuplicatesInArray<string>(
          allExpensesName.tb1,
          tb1
        );
        allExpensesName.tb2 = clearDuplicatesInArray<string>(
          allExpensesName.tb2,
          tb2
        );

        totalMonths[i] = [totalMonth[0], [...totalMonth[1], ""]];
        totals.tb1 = sumaArray(
          totals.tb1 as number[],
          totalMonth[0] as number[]
        );
        totals.tb2 = sumaArray(
          totals.tb2 as number[],
          totalMonth[1] as number[]
        );
      }

      totals.tb2.push("");

      const compiledTemplate = pug.compileFile(this.templatePath);

      const htmlContent = compiledTemplate({
        dataMonths,
        totalMonths,
        expensesName,
        totals,
        allExpensesName,
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

  async generateDJ08(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { declared = false, user }: { declared: boolean; user: User } =
        req.body;

      this.templatePath = pugTemplatePath("dj08/swornDeclaration");

      const dateSigns = {
        day: moment().date(),
        month: moment().month() + 1,
        year: moment().year(),
      };

      const select: FindOptionsSelect<SectionState> = {
        profile: {
          id: true,
          first_name: true,
          last_name: true,
          ci: true,
          nit: true,
          run_in_municipality: true,
          is_tcp: true,
        },
        fiscalYear: {
          id: true,
          year: true,
          declared: true,
          individual: true,
          regimen: true,
          musicalGroup: { description: true, number_members: true },
          dj08: {
            id: true,
            dj08SectionData: {
              id: true,
              is_rectification: true,
              section_data: true,
            },
          },
        },
      };

      const { profile, fiscalYear } = await SectionState.findOne({
        select,
        relations: {
          profile: { address: { address: true } },
          fiscalYear: { musicalGroup: true, dj08: { dj08SectionData: true } },
        },
        where: { user: { id: user.id } },
      });

      const {
        first_name,
        last_name,
        ci,
        nit,
        address,
        run_in_municipality,
        is_tcp,
      } = profile;
      const { year, individual, musicalGroup, regimen } = fiscalYear;

      ci.padEnd(11);
      nit.padEnd(11);

      const fileName = `DJ-08-IP-${year}.pdf`;

      const dJ08 = fiscalYear.dj08[0];

      const dj08SectionData = dJ08?.dj08SectionData.find(
        (val) => val.is_rectification === true
      );

      let newDataDJ08ToDeclared: Dj08SectionData;

      if (
        !fiscalYear.declared &&
        declared === true &&
        dJ08.dj08SectionData?.length < 2
      ) {
        newDataDJ08ToDeclared = Dj08SectionData.create({
          section_data: dj08SectionData.section_data,
          is_rectification: false,
          dJ08,
        });

        fiscalYear.declared = true;
        await fiscalYear.save();
        dj08SectionData.is_rectification = false;
      }

      dj08SectionData.section_data = JSON.parse(dj08SectionData.section_data);
      const is_rectification =
        dj08SectionData.is_rectification && declared && fiscalYear.declared;

      const [dataSectionA, totalSectionA] = getDataAndTotalsToDj08Sections<
        DataSectionAType,
        TotalSectionAType
      >(dj08SectionData, SectionName.SECTION_A);
      totalSectionA.incomes = parseFloat(totalSectionA.incomes.toFixed());
      totalSectionA.expenses = parseFloat(totalSectionA.expenses.toFixed());

      const {
        F11 = 0,
        F12,
        F13 = 0,
        F14,
        F15,
        F16,
        F17,
        F18,
        F19,
        F20,
      } = dj08SectionData.section_data[SectionName.SECTION_B]["data"] as {
        [key: string]: number;
      };

      const dataSectionB: DataSectionBType[] = [
        {
          concepto:
            "Ingresos obtenidos para  liquidación del Impuesto (viene de SECCIÓN A casilla 12 fila 10)",
          import: parseFloat(F11.toFixed()),
        },
        { concepto: "(-) Mínimo Exento Autorizado", import: F12 },
        {
          concepto:
            "(-) Gastos deducibles por el ejercicio de la actividad (viene de SECCIÓN A casilla 13 fila 10)",
          import: parseFloat(F13.toFixed()),
        },
        {
          concepto:
            "(-) Total de tributos pagados asociados a la actividad (viene de SECCIÓN F casilla 18 fila 44)",
          import: F14,
        },
        {
          concepto:
            "(-) Contribución para restauración y preservación de las zonas donde desarrollan su actividad",
          import: F15,
        },
        {
          concepto:
            "(-) Pagos por arrendamiento de bienes a entidades estatales autorizadas",
          import: F16,
        },
        {
          concepto:
            "(-)Importes exonerados por concepto de arrendamiento por asumir gastos de reparaciones",
          import: F17,
        },
        { concepto: "(-)Otros descuentos autorizados", import: F18 },
        {
          concepto: "(-) Bonificacion según aprobacion del MFP",
          import: F19,
        },
        {
          concepto:
            "Base Imponible (filas 11-12-13-14-15-16-17-18-19) pasa a SECCIÓN G, filas de casilla 20. Se distribuye por tramos",
          import: F20,
        },
      ];

      const {
        F21 = 0,
        F22 = 0,
        F23 = 0,
        F24 = 0,
        F25 = 0,
      } = dj08SectionData.section_data[SectionName.SECTION_C]["data"];

      const F26 =
        F21 >= F22 + F23 + F24 + F25 ? F21 - (F22 + F23 + F24 + F25) : 0;

      const F27 =
        is_tcp || F21 >= F22 + F23 + F24 + F25
          ? 0
          : (F21 - (F22 + F23 + F24 + F25)) * -1;

      const dataSectionC: DataSectionBType[] = [
        {
          concepto:
            "Impuesto a pagar según escala progresiva (viene de SECCIÓN G casilla 21 fila 50)",
          import: F21,
        },
        {
          concepto:
            "(-) Total de cuotas mensuales pagadas por el Titular a cuenta del impuesto en el período fiscal",
          import: F22,
        },
        {
          concepto:
            "(-) Otros pagos anticipados o Créditos del ejercicio fiscal anterior",
          import: F23,
        },
        { concepto: "(-) Total de retenciones", import: F24 },
        { concepto: "(-) Bonificaciones autorizadas", import: F25 },
        {
          concepto:
            "Impuesto a pagar (filas 21-22-23-24-25, si el resultado es mayor que cero)",
          import: F26,
        },
        {
          concepto:
            "Total a Devolver (filas 21-22-23-24-25, si el resultado es negativo) (Si es TCP se iguala a cero)",
          import: F27,
        },
      ];

      let {
        F28,
        F29,
        F30 = 0,
        F31,
      } = dj08SectionData.section_data[SectionName.SECTION_D]["data"] as {
        [key: string]: number;
      };

      const dj08SectionDataOld = dJ08?.dj08SectionData.find(
        (val) => val.is_rectification === false
      );

      if (dj08SectionDataOld) {
        const { F33: F33a = 0, F36: F36a = 0 } = JSON.parse(
          dj08SectionDataOld.section_data
        )[SectionName.SECTION_E]["data"];
        F28 = (F26 || 0) - F33a;
        F29 = F36a;
        F30 = F28 > F29 ? F28 - F29 : 0;
        F31 = F28 > F29 ? 0 : F29 - F28;
      }

      const dataSectionD = [
        {
          concepto:
            "Impuesto a pagar según Declaración Rectificada (viene de SECCIÓN C fila 26, rebajando el importe que le fue bonificado en la DJ - 08 que esta rectificando)",
          import: F28,
        },
        {
          concepto:
            "(-) Pago del impuesto realizado en la Declaración anterior",
          import: F29,
        },
        {
          concepto:
            "Diferencia Impuesto a Pagar en Declaración Rectificada (si fila 28 es mayor que fila 29)",
          import: F30,
        },
        {
          concepto:
            "Diferencia a devolver por declaración rectificada (si fila 28 es menor que fila 29)",
          import: F31,
        },
      ];

      const { F34 = 0 } = dj08SectionData.section_data[SectionName.SECTION_E][
        "data"
      ] as { [key: string]: number };

      const F32 = declared ? F30 : F26;
      const F33 =
        [1, 2].indexOf(dateSigns.month) !== -1
          ? parseFloat(((F32 * 5) / 100).toFixed())
          : 0;

      let F35 = 0;

      if (declared) {
        const limitDate = moment(`${year + 1}-04-30`);
        const moraDays = moment().isAfter(limitDate)
          ? calculeMoraDays(limitDate, moment())
          : 0;

        if (moraDays) {
          const payToMora = (debit: number, porcentage: number, days: number) =>
            debit * porcentage * days;

          F35 += payToMora(F32, 0.02, 30);

          if (moraDays > 30) {
            F35 += payToMora(F32, 0.05, 30);
          }

          if (moraDays > 60) {
            const mora = payToMora(F32, 0.001, moraDays - 60);
            const topMora = payToMora(F32, 0.3, 1);

            F35 =
              mora < topMora
                ? parseFloat((F35 += mora).toFixed())
                : parseFloat((F35 += topMora).toFixed());
          }
        }
      }

      const F36 = F32 - F33 - F34 + F35;

      if (declared && newDataDJ08ToDeclared) {
        const section_data = JSON.parse(newDataDJ08ToDeclared.section_data);
        section_data[SectionName.SECTION_E]["data"] = {
          F32,
          F33,
          F34,
          F35,
          F36,
        };

        newDataDJ08ToDeclared.section_data = JSON.stringify(section_data);
        await newDataDJ08ToDeclared.save();
      }

      const dataSectionE = [
        {
          concepto:
            "IMPUESTO A PAGAR (viene de filas 26 o fila 30 según corresponda: son excluyentes)",
          import: F32,
        },
        {
          concepto:
            "(-) Bonificaciones (se aplican los % autorizados al importe de la fila 32)",
          import: F33,
        },
        {
          concepto:
            "(-) Impuesto pagado en Declaraciones Juradas presentadas en el año fiscal",
          import: F34,
        },
        {
          concepto:
            "(+) Recargo por mora (se aplica al importe de fila 32, si se paga fuera de fecha, si se paga en fecha = 0 )",
          import: F35,
        },
        {
          concepto:
            "TOTAL A PAGAR ( fila 32 – fila 33 - fila 34 + fila 35 según corresponda)",
          import: F36,
        },
      ];

      const sectionFData = dj08SectionData.section_data[SectionName.SECTION_F][
        "data"
      ] as {
        [key: string]: DataSectionBType;
      };

      const totalSectionF = [
        {
          concepto: "Total de tributos pagados",
          import: sectionFData.F44?.import?.toFixed(),
        },
      ];

      const dataSectionF = [
        {
          concepto: "Impuesto sobre las Ventas y/o Servicio",
          import: sectionFData.F37?.import?.toFixed(),
        },
        { concepto: "", import: sectionFData.F38?.import?.toFixed() },
        {
          concepto: "Impuesto por la Utilización de la Fuerza de Trabajo",
          import: sectionFData.F39?.import?.toFixed(),
        },
        {
          concepto: "Impuesto sobre Documentos",
          import: sectionFData.F40?.import?.toFixed(),
        },
        {
          concepto: "Tasa por la Radicación de Anuncios y Propaganda Comercial",
          import: sectionFData.F41?.import?.toFixed(),
        },
        {
          concepto: "Contribución a la Seguridad Social",
          import: sectionFData.F42?.import?.toFixed(),
        },
        { concepto: "Otros", import: sectionFData.F43?.import?.toFixed() },
      ];

      const [dataSectionG, totalSectionG] = getDataAndTotalsToDj08Sections<
        DataSectionGType,
        TotalSectionGType
      >(dj08SectionData, SectionName.SECTION_G);

      const [dataSectionH, totalSectionH] = getDataAndTotalsToDj08Sections<
        DataSectionHType,
        TotalSectionGType
      >(dj08SectionData, SectionName.SECTION_H);

      const [dataSectionI, totalSectionI] = getDataAndTotalsToDj08Sections<
        DataSectionIType,
        TotalSectionIType
      >(dj08SectionData, SectionName.SECTION_I);

      const rowsSectionF = dataSectionF.length + 3;
      const rowsSectionG = dataSectionF.length + 2;
      const rowsSectionH = dataSectionH.length + 3;
      const rowsSectionI = dataSectionI.length + 4;

      const compiledTemplate = pug.compileFile(this.templatePath);

      const htmlContent = compiledTemplate({
        year,
        first_name,
        last_name,
        ci,
        nit,
        address,
        email: user.email,
        individual,
        musicalGroup,
        is_rectification,
        regimen,
        dateSigns,
        operatesInMunicipality: run_in_municipality,
        dataSectionA,
        totalSectionA,
        dataSectionB,
        dataSectionC,
        dataSectionD,
        dataSectionE,
        totalToPay: F36,
        dataSectionF,
        totalSectionF,
        dataSectionG,
        totalSectionG,
        dataSectionH,
        totalSectionH,
        dataSectionI,
        totalSectionI,
        rowsSectionF,
        rowsSectionG,
        rowsSectionH,
        rowsSectionI,
      });

      const pdfBuffer = await this.generatePDF({ htmlContent });

      res.contentType("application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName || this.defaultFileName}"`
      );
      res.send(pdfBuffer);
    } catch (error) {
      console.log(error);
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}

export default ReportGeneratorController;
