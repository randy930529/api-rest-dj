import { FindOptionsRelations, FindOptionsSelect, In } from "typeorm";
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

export async function getInitialsBalances(
  fiscalYearId: number,
  accountCodes: string[]
): Promise<Mayor[]> {
  return await Mayor.find({
    select: MAYOR_SELECT,
    relations: MAYOR_RELATIONS,
    where: {
      init_saldo: true,
      fiscalYear: { id: fiscalYearId },
      account: { code: In(accountCodes) },
    },
    order: { account: { code: "ASC" } },
  });
}
