import { Account } from "../../../../entity/Account";
import { FiscalYear } from "../../../../entity/FiscalYear";
import { VoucherDetail } from "../../../../entity/VoucherDetail";

export type CreateMayorDTO = {
  id?: number;
  date: Date;
  saldo?: number;
  init_saldo?: boolean;
  voucherDetail: VoucherDetail;
  fiscalYear: FiscalYear;
};
