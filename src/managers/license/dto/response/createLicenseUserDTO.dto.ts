import { LicenseUserDTO } from "../request/licenseUser.dto";

export type CreateLicenseUserDTO = LicenseUserDTO & {
  expirationDate: Date;
  UrlResponse: string;
};
