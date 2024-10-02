import { Account } from "../../../../entity/Account";
import { Voucher } from "../../../../entity/Voucher";

export type VoucherDetailDTO = {
  debe: number;
  haber: number;
  voucher: Voucher;
  account: Account;
};
