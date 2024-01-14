import { User } from "../../../entity/User";

export type CreateProfileDTO = {
  id: number;
  first_name: string;
  last_name: string;
  ci: string;
  nit: string;
  address: string;
  user: User;
};
