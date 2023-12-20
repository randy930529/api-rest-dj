import { Address } from "../../../../entity/Address";
import { Profile } from "../../../../entity/Profile";

export type HiredPersonDTO = {
  name: string;
  last_name: string;
  ci: string;
  address: Address;
  profile: Profile;
};
