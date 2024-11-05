import { User } from "../../../entity/User";

export type CreateBalanceReport = {
  date_end?: Date;
  user: User;
};
