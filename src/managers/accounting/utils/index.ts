import { NotBrackets } from "typeorm";
import { Account } from "../../../entity/Account";
import { FiscalYear } from "../../../entity/FiscalYear";
import { Mayor } from "../../../entity/Mayor";
import { VoucherDetail } from "../../../entity/VoucherDetail";
import { CreateMayorDTO } from "../dto/request/createMayor.dto";
import {
  getBiggerAccountsInitials,
  getMayorsTheAccountToFiscalYear,
} from "./query/mayorsTheAccountInToFiscalYear.fetch";

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

export async function passPreviousBalanceToInitialBalance(
  fiscalYear: FiscalYear
): Promise<void> {
  if (!fiscalYear.run_acounting) return;

  const [codeAccountInitials] = await getAccountInitialsBalances();

  const previousFiscalYear = await FiscalYear.findOneBy({
    year: fiscalYear.year - 1,
    profile: { id: fiscalYear.__profileId__ },
  });

  if (!previousFiscalYear) return;

  const balancesInitials = await getBiggerAccountsInitials(
    previousFiscalYear?.id,
    codeAccountInitials
  );

  const promises = balancesInitials.map(
    async ({ account, voucherDetail, date, saldo }) => {
      const { debe, haber } = voucherDetail;
      return Mayor.create({
        date,
        account,
        fiscalYear,
        init_saldo: true,
        saldo,
        voucherDetail: await VoucherDetail.create({
          account,
          debe,
          haber,
        }).save(),
      }).save();
    }
  );

  await Promise.all(promises);
}

export async function updateMayors(fieldsMayor: CreateMayorDTO): Promise<void> {
  const { account, debe, haber } = fieldsMayor.voucherDetail;
  const fiscalYearId = fieldsMayor.fiscalYear.id;
  const accountId = account?.id;

  fieldsMayor.id ||
    (await Mayor.create({
      ...fieldsMayor,
      saldo: calculeSaldo(0, debe, haber),
      account,
    }).save());

  const [mayorsToUpdate] = await getUpdateBalances(accountId, fiscalYearId);

  await Mayor.save(mayorsToUpdate);
}

export async function getUpdateBalances(
  accountId: number,
  fiscalYearId: number
): Promise<[Mayor[], number]> {
  const mayorsToBalanceAccount = await getMayorsTheAccountToFiscalYear(
    fiscalYearId,
    accountId
  );

  return mayorsToBalanceAccount.reduce<[Mayor[], number]>(
    ([mayorsToUpdate, saldo], val) => {
      const { debe, haber } = val.voucherDetail;
      saldo = calculeSaldo(saldo, debe, haber);
      if (val.saldo !== saldo) {
        val.saldo = saldo;
        mayorsToUpdate.push(val);
      }
      return [mayorsToUpdate, saldo];
    },
    [[], 0]
  );
}

export function isIncomeOrExpense(accountCode: string = ""): boolean | void {
  if (accountCode.startsWith("900")) {
    return true;
  } else if (
    accountCode.startsWith("810") ||
    ["800", "820"].indexOf(accountCode) !== -1
  ) {
    return false;
  } else {
    return;
  }
}

export function generateSaldoIncomesAndSaldoExpenses(
  balances: Mayor[]
): [number, number] {
  return balances.reduce(
    ([saldoIncomesTotal, saldoExpensesTotal], { saldo, account }) => {
      const isIncome = isIncomeOrExpense(account.code);
      if (isIncome === undefined)
        return [saldoIncomesTotal, saldoExpensesTotal];

      if (isIncome) {
        saldoIncomesTotal += saldo;
      } else {
        saldoExpensesTotal += saldo;
      }

      return [saldoIncomesTotal, saldoExpensesTotal];
    },
    [0, 0]
  );
}

export function calculeSaldo(
  initSaldo: number,
  debe: number,
  haber: number
): number {
  return initSaldo + debe - haber;
}

export function calculeUtility(
  saldoIncomes: number,
  saldoExpenses: number
): number {
  return Math.abs(saldoIncomes) - saldoExpenses;
}

export function calculeNetPatrimony(
  passiveTotal: number,
  patrimonyTotal: number
): number {
  return passiveTotal + patrimonyTotal;
}

export function verifyCuadreInAccount(balances: Mayor[]): boolean {
  const { totalDebe, totalHaber } = balances.reduce<{
    totalDebe: number;
    totalHaber: number;
  }>(
    (cuadre, { saldo }) => {
      if (saldo > 0) {
        cuadre.totalDebe += Number(saldo);
      } else {
        cuadre.totalHaber += Math.abs(saldo);
      }
      return cuadre;
    },
    { totalDebe: 0, totalHaber: 0 }
  );
  return totalDebe === totalHaber;
}

export function parse2Float(number: number): string {
  if (number === 0) return "0";
  return number.toFixed(2);
}
