import { User } from "../../../../entity/User";
import { Profile } from "../../../../entity/Profile";
import { Account } from "../../../../entity/Account";

export type ElementDTO = {
  description: string;
  type: string;
  group: string;
  is_general: boolean;
  help?: string;
  profile: Profile;
  user?: User;
  account?: Account;
};
