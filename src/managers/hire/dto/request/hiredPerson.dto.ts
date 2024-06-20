import { Address } from "../../../../entity/Address";
import { Profile } from "../../../../entity/Profile";

export type HiredPersonDTO = {
  first_name: string;
  last_name: string;
  ci: string;
  address: Address;
  profile: Profile;
};
