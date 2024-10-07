import { Account } from "../../../entity/Account";
import { User } from "../../../entity/User";

export type CreateMayorReport = {
  date_start: Date;
  date_end: Date;
  account: Account;
  user: User;
};
