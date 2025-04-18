import { FindOperator } from "typeorm";
import { ProfileAddress } from "../../entity/ProfileAddress";

export type ProgressiveScaleType = {
  from: number;
  to: number;
  porcentageType: number;
};

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

export type ObjectSectionBType = {
  [key: string]: DataSectionBType;
};

export type DataSectionGType = {
  from: number;
  to: number;
  baseImponible: number;
  porcentageType: number;
  import: number;
};

export type ObjectSectionGType = {
  [key: string]: DataSectionGType;
};

export type ObjectSectionAType = {
  [key: string]: DataSectionAType;
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

export type ExpensesNameType = {
  [key: number]: {
    tb1: string[];
    tb2: string[];
  };
};

export type ExpensesNameToTableType = {
  tb1: string[];
  tb2: string[];
};

export type TotalMonthsType = {
  [key: number]: (string | number)[][];
};

export type TotalsAnnualType = {
  tb1: (string | number)[];
  tb2: (string | number)[];
};

export type VoucherDetailType = {
  code: string;
  description: string;
  debe: number;
  haber: number;
};

export type AccountingVoucherType = {
  accounting: VoucherDetailType[];
  totalDebe: number;
  totalHaber: number;
};

export type DataVoucherReportType = AccountingVoucherType & {
  fullName: string;
  nit: string;
  printedDate: string | Date;
  number: number;
  documentNumber: string;
  descriptionVoucher: string;
  descriptionElement?: string;
  accountingDate: string | Date;
};

export type MayorDetailType = {
  code?: string;
  date?: string | Date;
  detail: string;
  debe: number;
  haber: number;
  saldo?: number;
};

export type AccountingMayorType = {
  accounting: MayorDetailType[];
  totalDebe: number;
  totalHaber: number;
};

export type MayorReportType = AccountingMayorType & {
  fullName: string;
  nit: string;
  printedDate: string;
  accountCode: string;
};

interface AssetType {
  activo: number;
  caja: number;
  banco: number;
  total: number;
}

interface PassiveType {
  pasivo: number;
  lendsShortTerm: number;
  longTerm: number;
  lendsLongTerm: number;
  total: number;
}

interface PatrimonyType {
  initSaldo: number;
  patrimonio: {
    description: string;
    amount: number;
  }[];
  total: number;
}

export type DataSituationStateReportType = {
  asset: AssetType;
  passive: PassiveType;
  patrimony: PatrimonyType;
  total: number;
};

export type DataYieldStateReportType = {
  averagePayments: number;
  capitalPayments: number;
  utilityOrLost: number;
  expesesToPayments: Map<
    string,
    {
      description: string;
      amount: number;
    }
  >;
};

export type SearchRangeType<T> =
  | {
      searchRange: FindOperator<T>;
    }
  | {
      searchRange: T;
    };
