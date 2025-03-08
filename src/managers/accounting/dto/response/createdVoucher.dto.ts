import { VoucherDTO } from "../request/voucher.dto";

export type CreatedVoucherDTO = VoucherDTO & {
  id: number;
};
