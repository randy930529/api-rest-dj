import { Profile } from "../../../../entity/Profile";

export type ElementDTO = {
  description: string;
  type: string;
  group: string;
  help?: string;
  profile: Profile;
};
