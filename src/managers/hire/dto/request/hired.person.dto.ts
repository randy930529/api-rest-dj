import { Profile } from "../../../../entity/Profile";

export class HiredPersonDTO {
  name: string;
  last_name: string;
  ci: string;
  profile: Profile;
}
