import {
  FindOptionsSelect,
  FindOptionsRelations,
  FindOptionsOrder,
} from "typeorm";
import { StateTMBill } from "../../../entity/StateTMBill";

export const STATE_TMBILL_SELECT: FindOptionsSelect<StateTMBill> = {
  tmBill: {
    id: true,
    import: true,
  },
};

export const STATE_TMBILL_RELATIONS: FindOptionsRelations<StateTMBill> = {
  tmBill: true,
};

export const STATE_TMBILL_ORDER: FindOptionsOrder<StateTMBill> = {
  updated_at: "ASC",
};
