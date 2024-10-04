import { Account } from "../../../../entity/Account";
import { FiscalYear } from "../../../../entity/FiscalYear";
import { VoucherDetail } from "../../../../entity/VoucherDetail";

export type CreateMayorDTO = {
  id?: number;
  date: Date;
  saldo?: number;
  is_reference?: boolean;
  voucherDetail: VoucherDetail;
  fiscalYear: FiscalYear;
};
