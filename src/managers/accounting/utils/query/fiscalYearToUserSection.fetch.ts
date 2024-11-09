import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { SectionState } from "../../../../entity/SectionState";

export const SECTION_SELECT: FindOptionsSelect<SectionState> = {
  fiscalYear: {
    id: true,
    year: true,
  },
};

export const SECTION_RELATIONS: FindOptionsRelations<SectionState> = {
  fiscalYear: true,
};
