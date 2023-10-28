import { Profile } from "../../../../entity/Profile";

export type FiscalYearDTO = {
  year: number;
  general_scheme?: boolean;
  profile: Profile;
};
