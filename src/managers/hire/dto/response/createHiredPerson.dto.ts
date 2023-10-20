import { Profile } from "../../../../entity/Profile";

export class CreateHiredPersonDTO {
  name: string;
  last_name: string;
  ci: string;
  profile: Profile;
}
