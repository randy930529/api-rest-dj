import { HiredPerson } from "../../../../entity/HiredPerson";
import { ProfileHiredPersonActivity } from "../../../../entity/ProfileHiredPersonActivity";
import { FiscalYear } from "../../../../entity/FiscalYear";

export type ProfileHiredPersonDTO = {
  date_start: Date;
  date_end: Date;
  import?: number;
  fiscalYear: FiscalYear;
  hiredPerson: HiredPerson;
  profileHiredPersonActivity?: ProfileHiredPersonActivity[];
};
