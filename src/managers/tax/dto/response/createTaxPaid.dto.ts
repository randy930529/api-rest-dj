import { TaxPaidDTO } from "../request/taxPaid.dto";

export type CreateTaxPaidDTO = TaxPaidDTO & {
  id: number;
};
