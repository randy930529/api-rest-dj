import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { FiscalYear } from "../../../../entity/FiscalYear";

export const DELETE_FISCAL_YEAR_SELECT: FindOptionsSelect<FiscalYear> = {
  profile: {
    id: true,
    primary: true,
  },
};

export const DELETE_FISCAL_YEAR_RELATIONS: FindOptionsRelations<FiscalYear> = {
  profile: true,
};
