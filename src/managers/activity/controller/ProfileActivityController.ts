import { AppDataSource } from "../../../data-source";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { ProfileActivity } from "../../../entity/ProfileActivity";

export class ProfileActivityController extends EntityControllerBase<ProfileActivity> {
  constructor() {
    const repository = AppDataSource.getRepository(ProfileActivity);
    super(repository);
  }
}
