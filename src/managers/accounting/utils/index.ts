import { NotBrackets } from "typeorm";
import { Account } from "../../../entity/Account";
import { FiscalYear } from "../../../entity/FiscalYear";
import { Mayor } from "../../../entity/Mayor";
import { VoucherDetail } from "../../../entity/VoucherDetail";
import { BiggerAccountsInitialsType } from "../../../utils/definitions";
import { CreateMayorDTO } from "../dto/request/createMayor.dto";
import {
  VOUCHER_DETAIL_ORDER,
  VOUCHER_DETAIL_RELATIONS,
  VOUCHER_DETAIL_SELECT,
} from "./query/voucherDetail.fetch";

export async function getAccountInitialsBalances(
  patrimonyAccouns: string = "6%",
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
    .getRawMany();

  const codeAccountInitials = acountInitials.map(({ code }) => code);

  return [codeAccountInitials, acountInitials];
}

export async function passPreviousBalanceToInitialBalance(
  fiscalYear: FiscalYear
): Promise<void> {
  const [codeAccountInitials] = await getAccountInitialsBalances();

  const previousFiscalYear = await FiscalYear.findOneBy({
    year: fiscalYear.year - 1,
    profile: { id: fiscalYear.__profileId__ },
  });
  const balancesInitials = await getBiggerAccountsInitials(
    previousFiscalYear,
    codeAccountInitials
  );

  const promises = balancesInitials.map(
    async ({ id, debe, haber, date, saldo }) => {
      return Mayor.create({
        date,
        account: { id },
        fiscalYear,
        init_saldo: true,
        saldo,
        voucherDetail: await VoucherDetail.create({
          account: { id },
          debe,
          haber,
        }).save(),
      }).save();
    }
  );

  await Promise.all(promises);
}

export async function getBiggerAccountsInitials(
  fiscalYear: FiscalYear,
  accountCodes: string[]
): Promise<BiggerAccountsInitialsType[]> {
  if (accountCodes.length === 0) {
    return [];
  }
  const codes = accountCodes.map((c) => `'${c}'`).join(",");

  return await Account.createQueryBuilder("account")
    .select(["id", "code", "description", "acreedor"])
    .innerJoinAndSelect(
      (qb) => {
        return qb
          .select(["date", "saldo", "init_saldo"])
          .addSelect(`"voucherDetail"."haber"`)
          .addSelect(`"voucherDetail"."debe"`)
          .addSelect(`"mayorAccount"."accountId"`, "mayor_accountId")
          .from(Mayor, "mayorAccount")
          .innerJoin(
            "mayorAccount.voucherDetail",
            "voucherDetail",
            `"mayorAccount"."accountId" = "voucherDetail"."accountId"`
          )
          .innerJoin(
            (subQuery) => {
              return subQuery
                .select(`"accountId", MAX("id") AS max_id`)
                .from(Mayor, "mayor")
                .where(`"mayor"."fiscalYearId"=:fiscalYearId`, {
                  fiscalYearId: fiscalYear.id,
                })
                .groupBy(`"accountId"`)
                .groupBy(`"accountId"`);
            },
            "lastMayor",
            `"mayorAccount"."accountId" = "lastMayor"."accountId" AND "mayorAccount"."id" = "lastMayor"."max_id"`
          );
      },
      "mayor",
      `"account"."id" = "mayor"."mayor_accountId"`
    )
    .where(`account.code IN(${codes})`)
    .orderBy("account.code", "ASC")
    .getRawMany();
}

export async function updateBiggers(
  fieldsMayor: CreateMayorDTO
): Promise<void> {
  const { account, debe, haber } = fieldsMayor.voucherDetail;
  const fiscalYearId = fieldsMayor.fiscalYear.id;
  const accountId = account?.id;

  const [mayorsToUpdate, saldo] = await updateBalances(accountId, fiscalYearId);

  fieldsMayor.id ||
    mayorsToUpdate.push(
      Mayor.create({
        ...fieldsMayor,
        saldo: saldo + debe - haber,
        account,
      })
    );

  await Mayor.save(mayorsToUpdate);
}

export async function updateBalances(
  accountId: number,
  fiscalYearId: number
): Promise<[Mayor[], number]> {
  const VOUCHER_DETAIL_WHERE = {
    account: { id: accountId },
    mayor: { fiscalYear: { id: fiscalYearId } },
  };
  const voucherDetailsToBalanceAccount = await VoucherDetail.find({
    select: VOUCHER_DETAIL_SELECT,
    relations: VOUCHER_DETAIL_RELATIONS,
    where: VOUCHER_DETAIL_WHERE,
    order: VOUCHER_DETAIL_ORDER,
  });

  return voucherDetailsToBalanceAccount.reduce<[Mayor[], number]>(
    ([mayorsToUpdate, saldo], val) => {
      saldo += val.debe - val.haber;
      if (val.mayor.saldo !== saldo) {
        val.mayor.saldo = saldo;
        mayorsToUpdate.push(val.mayor);
      }
      return [mayorsToUpdate, saldo];
    },
    [[], 0]
  );
}
