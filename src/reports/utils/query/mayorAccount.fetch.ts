import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
} from "typeorm";
import { Mayor } from "../../../entity/Mayor";

export const STATE_ACCOUNT_SELECT: FindOptionsSelect<Mayor> = {
  account: { id: true, code: true },
  voucherDetail: {
    id: true,
    voucher: { id: true, number: true },
  },
};

export const STATE_ACCOUNT_RELATIONS: FindOptionsRelations<Mayor> = {
  account: true,
  voucherDetail: { voucher: true },
};

export const STATE_ACCOUNT_ORDER: FindOptionsOrder<Mayor> = {
  account: { id: "ASC" },
  date: "DESC",
  voucherDetail: {
    voucher: { number: "DESC" },
  },
};
