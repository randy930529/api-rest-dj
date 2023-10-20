import { HiredPerson } from "../../../../entity/HiredPerson";
import { Profile } from "../../../../entity/Profile";

export class ProfileHiredPersonDTO {
  date_start: string;
  date_end: string;
  import: number;
  profile: Profile;
  hiredPerson: HiredPerson;
}
