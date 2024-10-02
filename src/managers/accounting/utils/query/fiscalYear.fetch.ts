import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { FiscalYear } from "../../../../entity/FiscalYear";

export const FISCAL_YEAR_SELECT: FindOptionsSelect<FiscalYear> = {
  supportDocuments: {
    id: true,
    type_document: true,
    amount: true,
    element: {
      id: true,
      description: true,
      type: true,
      group: true,
      is_general: true,
    },
  },
};

export const FISCAL_YEAR_RELATIONS: FindOptionsRelations<FiscalYear> = {
  supportDocuments: { element: true },
};
