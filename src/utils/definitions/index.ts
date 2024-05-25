import { ProfileAddress } from "../../entity/ProfileAddress";

export type SupportDocumentPartialType = {
  amount: string;
  date: Date;
  is_bank: boolean;
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
  documents: { amount: number; type: string }[];
};

export type DataIndexByType =
  | {
      [key: number]: (number | string)[][][];
    }
  | {
      [key: number]: number[][];
    }
  | number[][][];

export type DataDJ08Type = {
  first_name: string;
  last_name: string;
  ci: string;
  nit: string;
  address: ProfileAddress;
  activities: ProfileActivityPartialType[];
  enterprises: { amount: number; import: number; name: string }[];
  hiredPersons: {
    date_start: Date;
    date_end: Date;
    import: number;
    first_name: string;
    last_name: string;
    ci: string;
    municipality: string;
  }[];
};

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
  concepto?: string;
  import: number;
};

export type DataSectionGType = {
  from: number;
  to: number;
  baseImponible: number;
  porcentageType: number;
  import: number;
};

export type TotalSectionGType = {
  baseImponible: number;
  import: number;
};

export type DataSectionHType = {
  enterprise: string;
  valueHire: number;
  porcentage?: number;
  import: number;
};

export type TotalSectionHType = {
  valueHire: number;
  import: number;
};

export type DataSectionIType = {
  code: string | string[];
  fullName: string;
  from: number[];
  to: number[];
  municipality: string;
  nit: string | string[];
  import: number;
};

export type TotalSectionIType = {
  import: number;
};

export type AllDataSectionsDj08Type = {
  [key: string | number]: {
    data: {
      [key: string | number]:
        | DataSectionAType
        | DataSectionBType
        | DataSectionGType
        | DataSectionHType
        | DataSectionIType
        | number;
    };
    totals?:
      | TotalSectionAType
      | TotalSectionGType
      | TotalSectionHType
      | TotalSectionIType;
  };
};

export type AnswerType = {
  email: string;
  password: string;
  repeatPassword: string;
};
