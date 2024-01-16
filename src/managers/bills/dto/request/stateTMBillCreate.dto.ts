import { TMBill } from "../../../../entity/TMBill";

export type StateTMBillDTO = {
  success?: boolean;
  description?: string;
  tmBill: TMBill;
};
