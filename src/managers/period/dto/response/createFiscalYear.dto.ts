import { Profile } from "../../../../entity/Profile";

export type CreateFiscalYearDTO = {
  id: number;
  year: number;
  general_scheme: boolean;
  profile: Profile;
};
