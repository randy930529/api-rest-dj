import * as moment from "moment";
import { Account } from "../../../entity/Account";
import { FiscalYear } from "../../../entity/FiscalYear";
import { Mayor } from "../../../entity/Mayor";
import { VoucherDetail } from "../../../entity/VoucherDetail";
import { CreateMayorDTO } from "../dto/request/createMayor.dto";
import {
  getMayorAccountsInitials,
  getMayorsIncomesAndExpensesInitials,
  getMayorsTheAccountToFiscalYear,
} from "./query/mayorsTheAccountInToFiscalYear.fetch";
import { getAccountInitialsBalances } from "./query/initialBalance.fetch";

export async function passPreviousBalanceToInitialBalance(
  fiscalYear: FiscalYear
): Promise<void> {
  if (!fiscalYear.run_acounting) return;

  const [codeAccountInitials, accountInitials] =
    await getAccountInitialsBalances();

  const previousFiscalYear = await FiscalYear.findOneBy({
    year: fiscalYear.year - 1,
    profile: { id: fiscalYear.__profileId__ },
  });

  if (!previousFiscalYear || !previousFiscalYear?.run_acounting) return;

  let balancesInitials = await getMayorAccountsInitials(
    previousFiscalYear?.id,
    codeAccountInitials
  );

  balancesInitials = await getInitialPatrimony(
    previousFiscalYear?.id,
    accountInitials,
    balancesInitials
  );

  await pushInitialBalances(fiscalYear, balancesInitials);
}

export async function getPreviousMayorsToInitialBalances(
  fiscalYear: FiscalYear,
  codeAccountInitials: string[],
  accountInitials: Account[]
): Promise<Mayor[]> {
  if (!fiscalYear.run_acounting) return;

  const previousFiscalYear = await FiscalYear.findOneBy({
    year: fiscalYear.year - 1,
    profile: { id: fiscalYear.__profileId__ },
  });

  if (!previousFiscalYear) return;

  const balancesInitials = await getMayorAccountsInitials(
    previousFiscalYear?.id,
    codeAccountInitials
  );

  return await getInitialPatrimony(
    previousFiscalYear?.id,
    accountInitials,
    balancesInitials
  );
}

export async function updateMayors(fieldsMayor: CreateMayorDTO): Promise<void> {
  if (!fieldsMayor.fiscalYear?.run_acounting) return;

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

export function getAccountOfThePatrimony(accounts: Account[]): Account {
  return accounts.find(({ code }) => code === "600-10");
}

export async function getInitialPatrimony(
  fiscalYearId: number,
  accounts: Account[],
  mayors: Mayor[]
): Promise<Mayor[]> {
  const account = getAccountOfThePatrimony(accounts);
  if (!account) throw new Error("Account to initial patrimony not found.");

  const mayorsIncomesAndExpenses = await getMayorsIncomesAndExpensesInitials(
    fiscalYearId
  );

  const netPatrimony = calculeInitialPatrimony(
    mayors,
    mayorsIncomesAndExpenses
  );

  const resultMayorPatrimony = generateMayorPatrimony(account, -netPatrimony);

  return setMayorAccountPatrimony(account, resultMayorPatrimony, mayors);
}

export function calculeInitialPatrimony(
  mayorsPatrimony: Mayor[],
  mayorsOperations: Mayor[]
): number {
  const [saldoIncomes, saldoExpenses] =
    generateSaldoIncomesAndSaldoExpenses(mayorsOperations);
  const utility = calculeUtility(saldoIncomes, saldoExpenses);

  const patrimony = generateInitialPatrimony(mayorsPatrimony);
  return calculeNetPatrimony(patrimony, utility);
}

export function generateInitialPatrimony(mayors: Mayor[]): number {
  return mayors.reduce(
    (total, { saldo, account }) =>
      account.code?.startsWith("6") ? total - saldo : total,
    0
  );
}

export async function pushInitialBalances(
  fiscalYear: FiscalYear,
  mayors: Mayor[]
): Promise<Mayor[]> {
  return await Promise.all(
    mayors.map(({ account, saldo }) => {
      const [debe, haber] = [Math.max(saldo, 0), Math.max(-saldo, 0)];
      const date = moment(`${fiscalYear.year - 1}-12-31`).toDate();

      return createMayor(fiscalYear, account, date, debe, haber, saldo);
    })
  );
}

export async function createAndGetMayors(
  fiscalYear: FiscalYear,
  mayors: Mayor[]
): Promise<Mayor[]> {
  return await Promise.all(
    mayors.map((mayor) => {
      return createMayorAndUpdate(fiscalYear, mayor);
    })
  );
}

export async function createMayorAndUpdate(
  fiscalYear: FiscalYear,
  mayor: Mayor
): Promise<Mayor> {
  if (!mayor?.account) throw new Error("Create mayor required account.");

  const { account, saldo = 0 } = mayor;
  const [debe, haber] = [Math.max(saldo, 0), Math.max(-saldo, 0)];
  const date = moment(`${fiscalYear.year - 1}-12-31`).toDate();
  const newMayor = await createMayor(
    fiscalYear,
    account,
    date,
    debe,
    haber,
    saldo
  );

  if (fiscalYear.has_documents) {
    await updateMayors(newMayor);
  }

  return newMayor;
}

export async function createMayor(
  fiscalYear: FiscalYear,
  account: Account,
  date: Date,
  debe: number,
  haber: number,
  saldo: number
) {
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

export async function setMayorsToInitialBalances(
  fiscalYear: FiscalYear,
  previousBalances: Mayor[] = [],
  currentBalances: Mayor[] = []
): Promise<Mayor[]> {
  if (!currentBalances.length) {
    return await createAndGetMayors(fiscalYear, previousBalances);
  } else {
    const setAccountCodes = [
      ...new Set(
        [...currentBalances, ...previousBalances].map(
          ({ account }) => account.code
        )
      ),
    ];
    return await updateAndGetMayors(
      fiscalYear,
      currentBalances,
      previousBalances,
      setAccountCodes
    );
  }
}

export function generateMayorPatrimony(
  account: Account,
  netPatrimony: number
): Mayor {
  return Mayor.create({
    account,
    init_saldo: true,
    saldo: netPatrimony,
    voucherDetail: {
      account,
      debe: Math.max(netPatrimony, 0),
      haber: Math.max(-netPatrimony, 0),
    },
  });
}

export function setMayorAccountPatrimony(
  accountPatrimony: Account,
  mayor: Mayor,
  mayors: Mayor[]
): Mayor[] {
  mayors = mayors.filter(
    ({ account }) =>
      isMayorPatrimony(account.code, accountPatrimony.code) &&
      account?.code !== accountPatrimony.code
  );
  mayors.push(mayor);

  return mayors;
}

export function parse2Float(number: number): string {
  if (number === 0) return "0";
  return number.toFixed(2);
}

export function isMayorPatrimony(
  mayorAccountCode: string,
  accountPatrimonyCode: string
): boolean {
  return (
    !mayorAccountCode.startsWith(accountPatrimonyCode.charAt(0)) ||
    mayorAccountCode === accountPatrimonyCode
  );
}

export async function updateAndGetMayors(
  fiscalYear: FiscalYear,
  currents: Mayor[],
  previous: Mayor[],
  codes: string[]
) {
  const setCodes = [...new Set(codes)];
  const currentsMap = getObjectMapToCode<Mayor>(currents, getCodeCallback);
  const previousMap = getObjectMapToCode<Mayor>(previous, getCodeCallback);

  return await Promise.all(
    setCodes.map((code) =>
      makeUpdateOrCreate(
        fiscalYear,
        currentsMap.get(code),
        previousMap.get(code)
      )
    )
  );
}

export function makeUpdateOrCreate(
  fiscalYear: FiscalYear,
  currentMayor: Mayor,
  previouMayor: Mayor
) {
  if (currentMayor && previouMayor) {
    return getUpdateMayor(currentMayor, previouMayor.saldo);
  } else if (!currentMayor && previouMayor) {
    return createMayorAndUpdate(fiscalYear, previouMayor);
  }
  return currentMayor.save();
}

export async function getUpdateMayor(
  mayor: Mayor,
  saldo: number
): Promise<Mayor> {
  if (saldo === undefined || saldo === null || Number.isNaN(saldo))
    return mayor;

  const [debe, haber] = [Math.max(saldo, 0), Math.max(-saldo, 0)];
  const voucherDetail = await getUpdateMayorVoucherDetail(mayor, debe, haber);

  const updatedMayor = await Mayor.create({
    ...mayor,
    saldo,
    voucherDetail,
  }).save();

  if (mayor.fiscalYear?.has_documents) {
    await updateMayors(updatedMayor);
  }

  return updatedMayor;
}

export async function getUpdateMayorVoucherDetail(
  mayor: Mayor,
  debe: number,
  haber: number
) {
  return await VoucherDetail.create({
    ...mayor.voucherDetail,
    debe,
    haber,
  }).save();
}

export function getObjectMapToCode<T>(
  vals: T[],
  callback: (val: T) => string
): Map<string, T> {
  const mapToCode: Map<string, T> = new Map<string, T>();

  for (const val of vals) {
    if (!mapToCode.get(callback(val))) {
      mapToCode.set(callback(val), val);
    }
  }

  return mapToCode;
}

function getCodeCallback(mayor: Mayor): string {
  return mayor.account?.code;
}
