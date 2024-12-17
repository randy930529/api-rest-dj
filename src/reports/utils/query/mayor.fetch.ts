import {
  FindOptionsOrder,
  FindOptionsOrderValue,
  FindOptionsRelations,
  FindOptionsSelect,
  LessThan,
  LessThanOrEqual,
} from "typeorm";
import { Mayor } from "../../../entity/Mayor";
import { SearchRangeType } from "../../../utils/definitions";

export const MAYORS_SELECT: FindOptionsSelect<Mayor> = {
  voucherDetail: {
    id: true,
    debe: true,
    haber: true,
    voucher: { id: true, number: true },
  },
};

export const MAYORS_RELATIONS: FindOptionsRelations<Mayor> = {
  voucherDetail: { voucher: true },
};

export const MAYOR_ACCOUNT_SELECT: FindOptionsSelect<Mayor> = {
  ...MAYORS_SELECT,
  account: { id: true, code: true, description: true },
};

export const MAYOR_ACCOUNT_RELATIONS: FindOptionsRelations<Mayor> = {
  ...MAYORS_RELATIONS,
  account: true,
};

export function getMayorOrder(
  typeOrder: FindOptionsOrderValue
): FindOptionsOrder<Mayor> {
  return {
    date: typeOrder,
    voucherDetail: {
      voucher: { number: typeOrder },
    },
  };
}

export async function getMayorsOfTheFiscalYearUntilDate(
  fiscalYearId: number,
  date: Date
): Promise<Mayor[]> {
  return await Mayor.find({
    select: MAYOR_ACCOUNT_SELECT,
    relations: MAYOR_ACCOUNT_RELATIONS,
    order: getMayorOrder("DESC"),
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
    select: MAYORS_SELECT,
    relations: MAYORS_RELATIONS,
    order: getMayorOrder("ASC"),
    where: {
      fiscalYear: { id: fiscalYearId },
      account: { id: accountId },
      date: searchDate.searchRange,
    },
  });
}

export async function getInitialBalanceOfTheFiscalYearToDateRange(
  fiscalYearId: number,
  accountId: number,
  searchDate: Date
): Promise<Mayor> {
  return await Mayor.findOne({
    select: MAYORS_SELECT,
    relations: MAYORS_RELATIONS,
    order: getMayorOrder("DESC"),
    where: {
      fiscalYear: { id: fiscalYearId },
      account: { id: accountId },
      date: LessThan(searchDate),
    },
  });
}
