import { ProfileAddress } from "entity/ProfileAddress";

export type ProfileDTO = {
  first_name: string;
  last_name: string;
  ci: string;
  nit: string;
  address: ProfileAddress;
};
