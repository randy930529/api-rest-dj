import { ProfileAddress } from "../../../entity/ProfileAddress";
import { User } from "../../../entity/User";

export type ProfileDTO = {
  first_name: string;
  last_name: string;
  ci: string;
  nit: string;
  primary: boolean;
  run_in_municipality: string;
  address: ProfileAddress;
  user: User;
};
