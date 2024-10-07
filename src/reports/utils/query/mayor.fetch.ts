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
  account: { id: "ASC" },
  date: "ASC",
};
