import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { SectionState } from "../../../entity/SectionState";

export const SECTION_STATE_SELECT: FindOptionsSelect<SectionState> = {
  profile: {
    id: true,
    first_name: true,
    last_name: true,
    ci: true,
    nit: true,
    run_in_municipality: true,
    profile_email: true,
  },
  fiscalYear: {
    id: true,
    year: true,
    declared: true,
    individual: true,
    regimen: true,
    is_tcp: true,
    musicalGroup: { description: true, number_members: true },
    dj08: {
      id: true,
      dj08SectionData: {
        id: true,
        is_rectification: true,
        section_data: true,
      },
    },
  },
};

export const SECTION_STATE_RELATIONS: FindOptionsRelations<SectionState> = {
  profile: { address: { address: true } },
  fiscalYear: { musicalGroup: true, dj08: { dj08SectionData: true } },
};
