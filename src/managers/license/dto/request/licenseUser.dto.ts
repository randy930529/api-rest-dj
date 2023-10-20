import { License } from "../../../../entity/License";
import { User } from "../../../../entity/User";

export class LicenseUserDTO {
  user: User;
  license: License;
  active: boolean;
}
