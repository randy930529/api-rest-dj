import { FindOptionsSelect, FindOptionsRelations } from "typeorm";
import { Profile } from "../../../entity/Profile";
import { SECTION_RELATIONS, SECTION_SELECT } from "./sectionsUser.fetch";

export const PROFILE_SELECT: FindOptionsSelect<Profile> = {
  user: { id: true },
  fiscalYear: SECTION_SELECT.fiscalYear,
};

export const PROFILE_RELATIONS: FindOptionsRelations<Profile> = {
  user: true,
  fiscalYear: SECTION_RELATIONS.fiscalYear,
  address: { address: true },
  profileActivity: {
    activity: true,
  },
};
