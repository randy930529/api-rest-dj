import * as path from "path";
import * as moment from "moment";
import { SupportDocumentPartialType } from "../../utils/definitions";
import { Dj08SectionData } from "../../entity/Dj08SectionData";
import { appConfig } from "../../../config";

const totalElemetColumInExpensesReport: number = 16 as const;
const totalElemetColumNotGeneralsTb2: number = 3 as const;

export function getCantElemetColumExpenses(
  totalElemetColum: number = totalElemetColumInExpensesReport,
  totalElemetColumDDNotGeneralsTb2: number = totalElemetColumNotGeneralsTb2
): [number, number, number, string[]] {
  const { expensePD } = appConfig.group;

  if (!expensePD) throw new Error("Expenses group PD not found in app config.");

  const totalElemetColumGeneralsTb1 = expensePD.length;
  const totalElemetColumNotGeneralsTb1 =
    totalElemetColum -
    totalElemetColumGeneralsTb1 -
    totalElemetColumDDNotGeneralsTb2;

  return [
    totalElemetColumGeneralsTb1,
    totalElemetColumNotGeneralsTb1,
    totalElemetColumDDNotGeneralsTb2,
    expensePD,
  ];
}

const pugTemplatePath = (template: string) =>
  path.join(__dirname, `../../utils/views/reports/${template}.pug`);

const defaultDataArray = <T>(length: number, defaultValue: T): T[] =>
  Array(length).fill(defaultValue);

const indexBy = <T extends { id: string | number }>(
  array: T[]
): { [key: string]: T } =>
  array.reduce((acc, val) => {
    const index: string | number = val.id;
    acc[index] = val;
    return acc;
  }, {});

const sumaArray = (array1: number[], array2: number[]): number[] =>
  array1.reduce<number[]>((result, val, index) => {
    const sum = val + array2[index];
    return [...result, Number(sum.toFixed(2))];
  }, []);

const sumaTotal = (array: number[]): number =>
  array.reduce((suma, val) => parseFloat((suma + val).toFixed(2)), 0);

const getDataToDay = (
  documents: SupportDocumentPartialType[],
  data: string,
  group: string[],
  defaultValue: number[],
  cashInBank: number,
  cashInBox: number
): number[] => {
  const toDay = defaultValue;
  if (!documents.length) return toDay;

  for (let i = 0; i < documents.length; i++) {
    const document = documents[i];
    const index: number = group.indexOf(document.group?.trim());
    const value = parseFloat(document[data]);
    toDay[index] += value;
    document.is_bank ? (cashInBank += value) : (cashInBox += value);
  }

  return [...toDay, cashInBank, cashInBox];
};

const getDataExpensesInToMonthArrayToTables = (
  expensesGenerals: SupportDocumentPartialType[],
  expensesMePD: SupportDocumentPartialType[],
  expensesMeDD: SupportDocumentPartialType[]
): (number | string)[][][] => {
  const [
    totalElemetColumGeneralsTb1,
    totalElemetColumNotGeneralsTb1,
    totalElemetColumNotGeneralsTb2,
    expensePD,
  ] = getCantElemetColumExpenses();

  const expensesNameTb1 = defaultDataArray<string>(
    totalElemetColumNotGeneralsTb1,
    ""
  );
  let totalsTb1 = defaultDataArray<number>(13, 0);

  const expensesNameTb2 = defaultDataArray<string>(
    totalElemetColumNotGeneralsTb2,
    ""
  );
  let totalsTb2 = defaultDataArray<number>(10, 0);
  const expensesGeneralsForDaysTb2 = defaultDataArray<number>(31, 0);

  const totalsExpensesOperating = defaultDataArray<number>(31, 0);
  const cashInBox = defaultDataArray<number>(31, 0);
  const cashInBank = defaultDataArray<number>(31, 0);
  const totalPaid = defaultDataArray<number>(31, 0);

  const expensesMeNIEI = expensesGenerals.filter(
    (val) => val.group?.trim() === "niei"
  );

  const expensesForDaysTb1: (number | string)[][] = Array.from(
    { length: 31 },
    (_, day) => {
      const expensesGeneralsRecordedToDay: SupportDocumentPartialType[] =
        expensesGenerals.filter((val) => moment(val.date).date() === day + 1);

      const expensesGeneralsForDays = getDataToDay(
        expensesGeneralsRecordedToDay,
        "amount",
        expensePD,
        defaultDataArray<number>(totalElemetColumGeneralsTb1, 0),
        cashInBank[day],
        cashInBox[day]
      );

      if (expensesGeneralsRecordedToDay.length) {
        cashInBox[day] += expensesGeneralsForDays.pop();
        cashInBank[day] += expensesGeneralsForDays.pop();
      }

      const expensesMePDForDays = getExpensesInToDay(
        expensesMePD,
        expensesNameTb1,
        totalElemetColumNotGeneralsTb1,
        day
      );

      const sliceExpensesGeneralsForDays = expensesGeneralsForDays.splice(-2);
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

  const expensesForDaysTb2: (number | string)[][] = Array.from(
    { length: 31 },
    (_, day) => {
      const expensesMeDDForDays = getExpensesInToDay(
        expensesMeDD,
        expensesNameTb2,
        3,
        day
      );

      const expensesMeNIEIRecordedToDay = expensesMeNIEI.filter(
        (val) => moment(val.date).date() === day + 1
      );

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

  return [
    expensesForDaysTb1,
    expensesForDaysTb2,
    [expensesNameTb1, expensesNameTb2],
    [totalsTb1, totalsTb2],
  ];
};

function getExpensesInToDay(
  expenses: SupportDocumentPartialType[],
  expensesName: string[],
  colCont: number,
  day: number
): number[] {
  let nextCol = 0;
  const expensesMeRecordedToDay = expenses.filter(
    (val) => moment(val.date).date() === day + 1
  );
  let expensesInToDay = defaultDataArray<number>(colCont, 0);

  for (let i = 0; i < expensesMeRecordedToDay.length; i++) {
    const document = expensesMeRecordedToDay[i];

    const value = document.amount;
    const description = document.description;

    const insertIn: number = expensesName.indexOf(description);

    if (insertIn === -1) {
      expensesName[nextCol] = description;
      expensesInToDay[nextCol] = parseFloat(value);
      nextCol++;
    } else {
      expensesInToDay[insertIn] = parseFloat(value);
    }
  }

  return expensesInToDay;
}

const clearDuplicatesInArray = <T>(from: T[], to: T[]): T[] => {
  const setFrom = new Set(from);
  const uniqueElements: T[] = [...from];

  [...new Set(to)].filter((element, index) => {
    !setFrom.has(element) ? (uniqueElements[index] = element) : false;
  });

  return uniqueElements;
};

const toCompleteDataSection = <T>(
  start: number,
  section: number,
  dataSectionArray: T[]
): T[] => {
  const defaultElements = {
    1: {
      defaultData: {
        activity: "",
        period: { start: ["", ""], end: ["", ""] },
        income: null,
        expense: null,
      },
      to: 9,
    },
    6: {
      defaultData: {
        concepto: "",
        import: "",
      },
      to: 7,
    },
    7: {
      defaultData: {
        from: null,
        to: null,
        baseImponible: null,
        porcentageType: null,
        import: null,
      },
      to: 5,
    },
    8: {
      defaultData: {
        enterprise: "",
        valueHire: null,
        porcentage: null,
        import: null,
      },
      to: 10,
    },
    9: {
      defaultData: {
        code: defaultDataArray<string>(3, ""),
        fullName: "",
        from: [null, null],
        to: [null, null],
        municipality: "",
        nit: defaultDataArray<string>(11, ""),
        import: null,
      },
      to: 18,
    },
  };

  const { defaultData, to }: { defaultData: T; to: number } =
    defaultElements[section];

  for (let i = start; i < to; i++) {
    dataSectionArray.push(defaultData);
  }

  return dataSectionArray;
};

const getDataAndTotalsToDj08Sections = <T1, T2>(
  data: Dj08SectionData,
  section: number
): [T1[], T2] => {
  const { section_data } = data;

  const dataSection: T1[] = Object.values(section_data[section]["data"] || {});
  const totalSection: T2 = section_data[section]["totals"];

  toCompleteDataSection(dataSection.length, section, dataSection);
  return [dataSection, totalSection];
};

const calculeF20ToDj08 = <
  T extends {
    [key: string]: number;
  }
>(
  dataSection: T
): number => {
  const sumTotal = Object.keys(dataSection).reduce(
    (sum, key) =>
      dataSection[key] && key !== "F11" && key !== "F20"
        ? sum + dataSection[key]
        : sum,
    0
  );

  return parseFloat(
    (dataSection["F11"] > sumTotal
      ? dataSection["F11"] - sumTotal
      : 0
    ).toFixed()
  );
};

const calculeTradedDaysOfYear = (
  year: number,
  tradedDays: string[] = [...(appConfig?.tradedDays || [])]
) => {
  return tradedDays.map((val) => moment(`${year}${val}`).dayOfYear());
};

const calculeMoraDays = (
  startYear: number,
  startDate: moment.Moment,
  endDate: moment.Moment
): number => {
  let tradedDaysOfYear = calculeTradedDaysOfYear(startYear);
  let countMoraDays = 0;

  while (startDate.isBefore(endDate)) {
    if (startYear !== startDate.year()) {
      startYear = startDate.year();
      tradedDaysOfYear = calculeTradedDaysOfYear(startYear);
    }

    if (
      [0, 6].indexOf(startDate.weekday()) === -1 &&
      tradedDaysOfYear.indexOf(startDate.dayOfYear()) === -1
    ) {
      countMoraDays++;
    }
    startDate.add(1, "d");
  }

  return countMoraDays;
};

const calculateMora = (F32: number, F35: number, moraDays: number) => {
  const payToMora = (debit: number, porcentage: number, days: number = 1) =>
    parseFloat((debit * porcentage * days).toFixed());

  if (moraDays <= 30) {
    return F35 + payToMora(F32, 0.02);
  } else if (moraDays > 30 && moraDays <= 60) {
    return F35 + payToMora(F32, 0.05);
  } else if (moraDays > 60) {
    const mora = payToMora(F32, 0.001, moraDays);
    const topMora = payToMora(F32, 0.3);

    return mora <= topMora ? F35 + mora : F35 + topMora;
  }
  return 0;
};

export {
  pugTemplatePath,
  defaultDataArray,
  indexBy,
  sumaArray,
  sumaTotal,
  getDataToDay,
  getDataExpensesInToMonthArrayToTables,
  clearDuplicatesInArray,
  toCompleteDataSection,
  getDataAndTotalsToDj08Sections,
  calculeF20ToDj08,
  calculeMoraDays,
  calculateMora,
};
