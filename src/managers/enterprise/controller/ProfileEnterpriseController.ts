import { AppDataSource } from "../../../data-source";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { ProfileEnterprise } from "../../../entity/ProfileEnterprise";

export class ProfileEnterpriseController extends EntityControllerBase<ProfileEnterprise> {
  constructor() {
    const repository = AppDataSource.getRepository(ProfileEnterprise);
    super(repository);
  }
}
