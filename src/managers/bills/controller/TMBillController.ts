import { AppDataSource } from "../../../data-source";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { TMBill } from "../../../entity/TMBill";

export class TMBillController extends EntityControllerBase<TMBill> {
  constructor() {
    const repository = AppDataSource.getRepository(TMBill);
    super(repository);
  }
}
