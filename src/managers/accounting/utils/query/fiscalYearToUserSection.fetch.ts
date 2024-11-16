import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { SectionState } from "../../../../entity/SectionState";

export const SECTION_SELECT: FindOptionsSelect<SectionState> = {
  profile: {
    fiscalYear: {
      id: true,
      year: true,
      primary: true,
    },
  },
};

export const SECTION_RELATIONS: FindOptionsRelations<SectionState> = {
  profile: {
    fiscalYear: true,
  },
};
