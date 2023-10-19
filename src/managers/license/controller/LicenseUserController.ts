import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { LicenseUser } from "../../../entity/LicenseUser";

class LicenseUserController extends EntityControllerBase<LicenseUser> {
  constructor() {
    const repository = AppDataSource.getRepository(LicenseUser);
    super(repository);
  }
}
