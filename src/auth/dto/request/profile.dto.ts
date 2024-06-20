import { ProfileAddress } from "../../../entity/ProfileAddress";

export type ProfileDTO = {
  id?: number;
  nombre?: string;
  last_name?: string;
  ci?: string;
  nit?: string;
  address?: ProfileAddress;
};
