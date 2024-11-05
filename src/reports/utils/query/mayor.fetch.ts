import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
} from "typeorm";
import { Mayor } from "../../../entity/Mayor";

export const MAYOR_SELECT: FindOptionsSelect<Mayor> = {
  voucherDetail: {
    id: true,
    debe: true,
    haber: true,
    voucher: { id: true, number: true },
  },
};

export const MAYOR_RELATIONS: FindOptionsRelations<Mayor> = {
  voucherDetail: { voucher: true },
};

export const MAYOR_ORDER: FindOptionsOrder<Mayor> = {
  voucherDetail: {
    voucher: { number: "ASC" },
  },
  date: "ASC",
};

export const MAYOR_ACCOUNT_SELECT: FindOptionsSelect<Mayor> = {
  ...MAYOR_SELECT,
  account: { id: true, code: true, description: true },
};

export const MAYOR_ACCOUNT_RELATIONS: FindOptionsRelations<Mayor> = {
  ...MAYOR_RELATIONS,
  account: true,
};

export const MAYOR_ACCOUNT_ORDER: FindOptionsOrder<Mayor> = {
  id:"DESC",
  voucherDetail: {
    voucher: { number: "DESC" },
  },
  date: "DESC",
};
