import { AppDataSource } from "../../../data-source";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { Activity } from "../../../entity/Activity";

export class ActivityController extends EntityControllerBase<Activity> {
  constructor() {
    const repository = AppDataSource.getRepository(Activity);
    super(repository);
  }
}
