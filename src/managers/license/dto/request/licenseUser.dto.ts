import { License } from "../../../../entity/License";
import { User } from "../../../../entity/User";

export type LicenseUserDTO = {
  user: User;
  license: License;
  active: boolean;
};
