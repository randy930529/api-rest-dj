import { In, Like, Not } from "typeorm";
import { Mayor } from "../../../../entity/Mayor";
import { getLastMayorInAccounts } from "../../../../reports/utils";
import {
  getMayorOrder,
  MAYOR_ACCOUNT_RELATIONS,
  MAYOR_ACCOUNT_SELECT,
} from "../../../../reports/utils/query/mayor.fetch";

export async function getMayorsTheAccountToFiscalYear(
  fiscalYearId: number,
  accountId: number
): Promise<Mayor[]> {
  return await Mayor.find({
    select: MAYOR_ACCOUNT_SELECT,
    relations: MAYOR_ACCOUNT_RELATIONS,
    order: getMayorOrder("ASC"),
    where: {
      fiscalYear: { id: fiscalYearId },
      account: { id: accountId },
    },
  });
}

export async function getLastMayorOfTheAccounts(
  fiscalYearId: number
): Promise<Mayor[]> {
  return getLastMayorInAccounts(
    await Mayor.find({
      select: MAYOR_ACCOUNT_SELECT,
      relations: MAYOR_ACCOUNT_RELATIONS,
      order: getMayorOrder("DESC"),
      where: {
        fiscalYear: { id: fiscalYearId },
      },
    })
  );
}

export async function getMayorAccountsInitials(
  fiscalYearId: number,
  accountCodes: string[]
): Promise<Mayor[]> {
  if (accountCodes.length === 0) {
    return [];
  }

  return getLastMayorInAccounts(
    await Mayor.find({
      select: MAYOR_ACCOUNT_SELECT,
      relations: MAYOR_ACCOUNT_RELATIONS,
      order: getMayorOrder("DESC"),
      where: {
        fiscalYear: { id: fiscalYearId },
        account: { code: In(accountCodes) },
      },
    })
  );
}

export async function getMayorsIncomesAndExpensesInitials(
  fiscalYearId: number,
  incomeAccountCode: string = "9%",
  expenseAccountCode: string = "8%"
) {
  return getLastMayorInAccounts(
    await Mayor.find({
      select: MAYOR_ACCOUNT_SELECT,
      relations: MAYOR_ACCOUNT_RELATIONS,
      order: getMayorOrder("DESC"),
      where: {
        fiscalYear: { id: fiscalYearId },
        account: [
          { code: Like(incomeAccountCode) },
          { code: Like(expenseAccountCode) },
        ],
      },
    })
  );
}
