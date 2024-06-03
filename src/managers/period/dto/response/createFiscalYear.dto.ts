import { Profile } from "../../../../entity/Profile";
import { MusicalGroup } from "../../../../entity/MusicalGroup";

export type CreateFiscalYearDTO = {
  id: number;
  year: number;
  general_scheme: boolean;
  profile: Profile;
  declared?: boolean;
  individual: boolean;
  regimen?: boolean;
  musicalGroup?: MusicalGroup;
};
