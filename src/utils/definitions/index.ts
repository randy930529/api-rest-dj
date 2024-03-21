export type SupportDocumentPartialType = {
  amount: string;
  date: Date;
  elementId: number;
  description: string;
  is_general: boolean;
  group: string;
  month: string;
};

export type ProfileActivityPartialType = {
  activity: string;
  code: string;
  date_start: Date;
  date_end: Date;
  amount: string;
  date: Date;
  type: string;
};

export type DataIndexByType =
  | {
      [key: number]: (number | string)[][][];
    }
  | {
      [key: number]: number[][];
    }
  | number[][][];

export type DataSectionAType = {
  activity: string;
  period: {
    start: (string | number)[];
    end: (string | number)[];
  };
  income: number;
  expense: number;
};

export type TotalSectionAType = {
  incomes: number;
  expenses: number;
};

export type DataSectionBType = {
  concepto: string;
  import: number;
};

export type DataSectionGType = {
  annualsNetIncomes: {
    from: number;
    to: number;
  };
  baseImponible: number;
  porcentageType: number;
  import: number;
};
