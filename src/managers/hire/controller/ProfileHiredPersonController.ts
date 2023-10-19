import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { ProfileHiredPerson } from "../../../entity/ProfileHiredPerson";

class ProfileHiredPersonController extends EntityControllerBase<ProfileHiredPerson> {
  constructor() {
    const repository = AppDataSource.getRepository(ProfileHiredPerson);
    super(repository);
  }
}
