export type SupportDocumentPartialType = {
  amount: string;
  date: Date;
  elementId: number;
  description: string;
  is_general: boolean;
  group: string;
  month: string;
};

export type DataIndexByType =
  | {
      [key: number]: (number | string)[][][];
    }
  | {
      [key: number]: number[][];
    }
  | number[][][];
