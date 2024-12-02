import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { Mayor } from "../../../../entity/Mayor";

export const MAYOR_SELECT: FindOptionsSelect<Mayor> = {
  voucherDetail: {
    id: true,
    debe: true,
    haber: true,
    account: { id: true, code: true, acreedor: true, description: true },
  },
  account: { id: true, code: true, acreedor: true, description: true },
};

export const MAYOR_RELATIONS: FindOptionsRelations<Mayor> = {
  voucherDetail: { account: true },
  account: true,
  fiscalYear: true,
};
