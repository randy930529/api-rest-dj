import { LicenseUser } from "../../../entity/LicenseUser";
import { FiscalYear } from "../../../entity/FiscalYear";
import { Profile } from "../../../entity/Profile";

export type SectionStateDTO = {
  license: LicenseUser;
  profile: Profile;
  fiscalYear: FiscalYear;
};
