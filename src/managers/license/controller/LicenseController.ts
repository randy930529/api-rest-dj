import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { License } from "../../../entity/License";

class LicenseController extends EntityControllerBase<License> {
  constructor() {
    const repository = AppDataSource.getRepository(License);
    super(repository);
  }
}
