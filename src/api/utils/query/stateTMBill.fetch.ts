import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
} from "typeorm";
import { StateTMBill } from "../../../entity/StateTMBill";

export const STATE_TMBILL_SELECT: FindOptionsSelect<StateTMBill> = {
  tmBill: {
    id: true,
    import: true,
    licenseUser: {
      id: true,
      licenseKey: true,
      license: { id: true, days: true, max_profiles: true },
      user: {
        id: true,
        email: true,
        active: true,
        end_license: true,
        max_profiles: true,
      },
    },
  },
};

export const STATE_TMBILL_RELATIONS: FindOptionsRelations<StateTMBill> = {
  tmBill: { licenseUser: { license: true, user: true } },
};

export const STATE_TMBILL_ORDER: FindOptionsOrder<StateTMBill> = { id: "ASC" };
