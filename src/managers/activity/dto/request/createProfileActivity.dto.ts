import { Activity } from "../../../../entity/Activity";
import { Profile } from "../../../../entity/Profile";

export type ProfileActivityDTO = {
  date_start: Date;
  date_end: Date;
  profile: Profile;
  activity: Activity;
};
