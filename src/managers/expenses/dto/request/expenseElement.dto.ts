import { Profile } from "../../../../entity/Profile";

export type ExpenseElementDTO = {
  description: string;
  type: string;
  profile: Profile;
};
