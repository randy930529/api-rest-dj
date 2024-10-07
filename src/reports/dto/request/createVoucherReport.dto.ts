import { User } from "../../../entity/User";

export type CreateVoucherReport = {
  rangeDate: [date_start: Date, date_end?: Date];
  rangeVouchers?: [voucher_start: number, voucher_end?: number];
  user: User;
};
