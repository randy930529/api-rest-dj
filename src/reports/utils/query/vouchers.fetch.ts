import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { Voucher } from "../../../entity/Voucher";

export const VOUCHER_SELECT: FindOptionsSelect<Voucher> = {
  voucherDetails: {
    id: true,
    debe: true,
    haber: true,
    account: { id: true, code: true, description: true },
  },
};

export const VOUCHER_RELATIONS: FindOptionsRelations<Voucher> = {
  voucherDetails: { account: true },
};
