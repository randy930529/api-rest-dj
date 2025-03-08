import {
  FindOptionsSelect,
  FindOptionsRelations,
  FindOptionsOrder,
} from "typeorm";
import { LicenseUser } from "../../../entity/LicenseUser";

export const LISENCE_USER_SELECT: FindOptionsSelect<LicenseUser> = {};

export const LISENCE_USER_RELATIONS: FindOptionsRelations<LicenseUser> = {
  user: true,
  license: true,
};

export const LISENCE_USER_ORDER: FindOptionsOrder<LicenseUser> = {
  expirationDate: "DESC",
};
