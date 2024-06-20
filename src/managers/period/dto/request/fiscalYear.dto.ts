import { Profile } from "../../../../entity/Profile";
import { MusicalGroup } from "../../../../entity/MusicalGroup";

export type FiscalYearDTO = {
  year: number;
  general_scheme?: boolean;
  profile: Profile;
  declared?: boolean;
  individual: boolean;
  regimen?: boolean;
  musicalGroup?: MusicalGroup;
};
