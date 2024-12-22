import { Account } from "../../entity/Account";
import { User } from "../../entity/User";

export type CreateConfigDTO = {
  email_from?: string;
  license_free_days?: number;
  inactivity_max?: number;
  except_min?: number;
  allowance?: number;
  company?: {
    name: string;
    source: number;
    address: string;
    phoneNumber: string;
    email: string;
  };
  mora_scale?: {
    from: number;
    to: number;
    porcentage: number;
  }[];
  accountBox: Account;
  accountBank: Account;
  progressiveScale?: {
    id?: number;
    is_normal: boolean;
    // tramo?: number;
    from: number;
    to: number;
    porcentage: number;
  }[];
  accountLongTerm: Account;
  accountShortTerm: Account;
  user: User;
};
