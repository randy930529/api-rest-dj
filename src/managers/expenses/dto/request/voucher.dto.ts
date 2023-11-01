import { SupportDocument } from "../../../../entity/SupportDocument";

export type VoucherDTO = {
  number: number;
  date: Date;
  description: string;
  supportDocument: SupportDocument;
};
