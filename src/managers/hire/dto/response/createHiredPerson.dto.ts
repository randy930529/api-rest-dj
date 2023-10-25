import { Profile } from "../../../../entity/Profile";

export type CreateHiredPersonDTO = {
  name: string;
  last_name: string;
  ci: string;
  profile: Profile;
};
