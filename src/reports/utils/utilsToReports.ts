import * as path from "path";
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

export {
  pugTemplatePath,
  defaultDataArray,
  indexBy,
  sumaArray,
  sumaTotal,
  getDataToDay,
};
