import { Profile } from "../../../../entity/Profile";

export type FiscalYearDTO = {
  year: number;
  general_scheme?: boolean;
  current: boolean;
  profile: Profile;
};
