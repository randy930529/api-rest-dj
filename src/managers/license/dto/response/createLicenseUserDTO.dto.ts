import { LicenseUserDTO } from "../request/licenseUser.dto";

export type CreateLicenseUserDTO = LicenseUserDTO & {
  licenseKey: string;
};
