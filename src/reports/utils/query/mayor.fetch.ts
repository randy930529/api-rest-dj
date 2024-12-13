import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  LessThanOrEqual,
} from "typeorm";
import { Mayor } from "../../../entity/Mayor";
import {
  BiggerAccountsInitialsType,
  SearchRangeType,
} from "../../../utils/definitions";
import { getLastMayorInAccount } from "../../../managers/accounting/utils/query/queryLastMayorInAccount.fetch";

export const MAYOR_SELECT: FindOptionsSelect<Mayor> = {
  voucherDetail: {
    id: true,
    debe: true,
    haber: true,
    voucher: { id: true, number: true },
  },
};

export const MAYOR_RELATIONS: FindOptionsRelations<Mayor> = {
  voucherDetail: { voucher: true },
};

export const MAYOR_ORDER: FindOptionsOrder<Mayor> = {
  voucherDetail: {
    voucher: { number: "ASC" },
  },
  date: "ASC",
};

export const MAYOR_ACCOUNT_SELECT: FindOptionsSelect<Mayor> = {
  ...MAYOR_SELECT,
  account: { id: true, code: true, description: true },
};

export const MAYOR_ACCOUNT_RELATIONS: FindOptionsRelations<Mayor> = {
  ...MAYOR_RELATIONS,
  account: true,
};

export const MAYOR_ACCOUNT_ORDER: FindOptionsOrder<Mayor> = {
  id: "DESC",
  voucherDetail: {
    voucher: { number: "DESC" },
  },
  date: "DESC",
};

export async function getMayorsOfTheFiscalYearUntilDate(
  fiscalYearId: number,
  date: Date
): Promise<Mayor[]> {
  return await Mayor.find({
    select: MAYOR_ACCOUNT_SELECT,
    relations: MAYOR_ACCOUNT_RELATIONS,
    order: MAYOR_ACCOUNT_ORDER,
    where: {
      fiscalYear: { id: fiscalYearId },
      date: LessThanOrEqual(date),
    },
  });
}

export async function getMayorsOfTheFiscalYearInDateRange(
  fiscalYearId: number,
  accountId: number,
  searchDate: SearchRangeType<Date>
): Promise<Mayor[]> {
  return await Mayor.find({
    select: MAYOR_SELECT,
    relations: MAYOR_RELATIONS,
    order: MAYOR_ORDER,
    where: {
      fiscalYear: { id: fiscalYearId },
      account: { id: accountId },
      date: searchDate.searchRange,
    },
  });
}

//experimental
export async function getLastMayorInAccountOfTheFiscalYearQr(
  fiscalYearId: number,
  date: Date
): Promise<BiggerAccountsInitialsType[]> {
  return await getLastMayorInAccount(fiscalYearId)
    .where(`"mayor"."date" <= $date`, { date })
    .getRawMany<BiggerAccountsInitialsType>();
}
