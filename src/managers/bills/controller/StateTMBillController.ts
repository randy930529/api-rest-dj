import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "data-source";
import { StateTMBill } from "../../../entity/StateTMBill";

export class StateTMBillController extends EntityControllerBase<StateTMBill> {
  constructor() {
    const repository = AppDataSource.getRepository(StateTMBill);
    super(repository);
  }
}
