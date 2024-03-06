import { AppDataSource } from "../../../data-source";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { Enterprise } from "../../../entity/Enterprise";

export class EnterpriseController extends EntityControllerBase<Enterprise> {
  constructor() {
    const repository = AppDataSource.getRepository(Enterprise);
    super(repository);
  }
}
