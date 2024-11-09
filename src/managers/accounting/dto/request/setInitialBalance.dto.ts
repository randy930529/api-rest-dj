import { VoucherDetail } from "../../../../entity/VoucherDetail";
import { Account } from "../../../../entity/Account";
import { User } from "../../../../entity/User";
import { FiscalYear } from "../../../../entity/FiscalYear";

export type SetInitialBalanceDTO = {
  id?: number;
  user: User;
  voucherDetail: VoucherDetail;
  account: Account;
  fiscalYear: FiscalYear;
};
