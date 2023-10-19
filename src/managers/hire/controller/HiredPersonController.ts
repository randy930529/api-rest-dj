import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { HiredPerson } from "../../../entity/HiredPerson";

export class HiredPersonController extends EntityControllerBase<HiredPerson> {
  constructor() {
    const repository = AppDataSource.getRepository(HiredPerson);
    super(repository);
  }
}
