import * as path from "path";
import * as moment from "moment";
import { ENV } from "../../utils/settings/environment";
import { SupportDocumentPartialType } from "utils/definitions";

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
    return [...result, val + array2[index]];
  }, []);

const sumaTotal = (array: number[]): number =>
  array.reduce((suma, val) => suma + val, 0);

const getDataToDay = <T>(
  documents: SupportDocumentPartialType[],
  data: string,
  group: number[],
  defaultValue: T[]
): T[] => {
  const toDay = defaultValue;
  if (!documents.length) return toDay;

  for (let i = 0; i < documents.length; i++) {
    const document: SupportDocumentPartialType = documents[i];
    const index: number = group.indexOf(document.elementId);
    const value = parseFloat(document[data]) as unknown as T;
    toDay[index] = value;
  }

  return toDay;
};

const getDataExpensesInToMenthArrayToTables = (
  expensesGenerals: SupportDocumentPartialType[],
  expensesMePD: SupportDocumentPartialType[],
  expensesMeDD: SupportDocumentPartialType[]
): (number | string)[][][] => {
  const { expenseId_PD } = ENV.group;

  const expensesNameTb1 = defaultDataArray<string>(6, "");
  let totalsTb1 = defaultDataArray<number>(13, 0);

  const expensesNameTb2 = defaultDataArray<string>(3, "");
  let totalsTb2 = defaultDataArray<number>(10, 0);
  const expensesGeneralsForDaysTb2 = defaultDataArray<number>(31, 0);

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

      const expensesGeneralsForDays = getDataToDay<number>(
        expensesGeneralsRecordedToDay,
        "amount",
        expenseId_PD,
        defaultDataArray<number>(7, 0)
      );

      const expensesMePDForDays = getExpensesInToDay(
        expensesMePD,
        expensesNameTb1,
        6,
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
    (val) => moment(val.date).date() === day
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

export {
  pugTemplatePath,
  defaultDataArray,
  indexBy,
  sumaArray,
  sumaTotal,
  getDataToDay,
  getDataExpensesInToMenthArrayToTables,
  clearDuplicatesInArray,
};
