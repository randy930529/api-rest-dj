import { Account } from "../../../../entity/Account";
import { Mayor } from "../../../../entity/Mayor";

export function getLastMayorInAccount(fiscalYearId: number) {
  return Account.createQueryBuilder("account")
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
                  fiscalYearId,
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
    .orderBy("account.code", "ASC");
}
