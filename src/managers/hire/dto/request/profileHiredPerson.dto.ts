import { HiredPerson } from "../../../../entity/HiredPerson";
import { Profile } from "../../../../entity/Profile";

export type ProfileHiredPersonDTO = {
  date_start: Date;
  date_end: Date;
  import: number;
  profile: Profile;
  hiredPerson: HiredPerson;
};
