import { FiscalYear } from "entity/FiscalYear";
import { Enterprise } from "../../../../entity/Enterprise";

export type FiscalYearEnterpriseDTO = {
  amount: number;
  import: number;
  enterprise: Enterprise;
  fiscalYear?: FiscalYear;
};
