import { Profile } from "../../../../entity/Profile";
import { HiredPerson } from "../../../../entity/HiredPerson";
import { ProfileHiredPersonActivity } from "../../../../entity/ProfileHiredPersonActivity";

export type ProfileHiredPersonDTO = {
  date_start: Date;
  date_end: Date;
  import?: number;
  profile: Profile;
  hiredPerson: HiredPerson;
  profileHiredPersonActivity?: ProfileHiredPersonActivity[]
};
