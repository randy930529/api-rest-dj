import {
  FindOptionsRelations,
  FindOptionsSelect,
  In,
  NotBrackets,
} from "typeorm";
import { Mayor } from "../../../../entity/Mayor";
import { Account } from "../../../../entity/Account";

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

export async function getAccountInitialsBalances(
  patrimonyAccouns: string = "",
  expenseAccouns: string = "8%",
  incomeAccouns: string = "9%"
): Promise<[string[], Account[]]> {
  const acountInitials = await Account.createQueryBuilder()
    .select(["id", "code", "description", "acreedor"])
    .where(
      new NotBrackets((qb) => {
        qb.where("code LIKE :patrimonyAccouns", {
          patrimonyAccouns,
        })
          .orWhere("code LIKE :expenseAccouns", {
            expenseAccouns,
          })
          .orWhere("code LIKE :incomeAccouns", {
            incomeAccouns,
          });
      })
    )
    .orderBy("code", "ASC")
    .getRawMany<Account>();

  const codeAccountInitials = acountInitials.map(({ code }) => code);

  return [codeAccountInitials, acountInitials];
}
