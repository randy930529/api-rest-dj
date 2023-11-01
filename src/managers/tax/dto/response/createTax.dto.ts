import { TaxDTO } from "../request/tax.dto";

export type CreateTaxDTO = TaxDTO & {
  id: number;
  code: string;
  active: boolean;
};
