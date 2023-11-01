import { VoucherDTO } from "../request/voucher.dto";

export type CreateVoucherDTO = VoucherDTO & {
  id: number;
};
