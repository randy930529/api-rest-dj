import { ProfileAddress } from "entity/ProfileAddress";
import { User } from "../../../entity/User";

export type CreateProfileDTO = {
  id: number;
  first_name: string;
  last_name: string;
  ci: string;
  nit: string;
  primary: boolean;
  run_in_municipality: string;
  profile_email?: string;
  address?: ProfileAddress;
  user: User;
};
