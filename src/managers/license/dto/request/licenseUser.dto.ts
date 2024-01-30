import { TMBillDTO } from "../../../bills/dto/request/tmBillCreate.dto";
import { License } from "../../../../entity/License";
import { User } from "../../../../entity/User";

export type LicenseUserDTO = {
  user?: User;
  license: License;
};
