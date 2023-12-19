import { Municipio } from "../../../../entity/Municipio";
import { Profile } from "../../../../entity/Profile";

export type HiredPersonDTO = {
  name: string;
  last_name: string;
  ci: string;
  address: string;
  profile: Profile;
  municipio: Municipio;
};
