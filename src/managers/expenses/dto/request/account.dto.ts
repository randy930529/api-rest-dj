import { Profile } from "../../../../entity/Profile";

export type AccountDTO = {
  code: string;
  description: string;
  moneda: string;
  profile: Profile;
};
