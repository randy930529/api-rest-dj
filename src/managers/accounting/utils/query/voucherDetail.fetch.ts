import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
} from "typeorm";
import { VoucherDetail } from "entity/VoucherDetail";

export const VOUCHER_DETAIL_SELECT: FindOptionsSelect<VoucherDetail> = {
  account: {
    id: true,
    code: true,
  },
  mayor: { id: true, saldo: true, fiscalYear: { id: true, balanced:true,individual:true } },
};

export const VOUCHER_DETAIL_RELATIONS: FindOptionsRelations<VoucherDetail> = {
  account: true,
  mayor: { fiscalYear: true },
};

export const VOUCHER_DETAIL_ORDER: FindOptionsOrder<VoucherDetail> = {
  id: "ASC",
};
