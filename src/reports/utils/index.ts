import { Between } from "typeorm";
import { SearchRangeType } from "../../utils/definitions";

export function getSearchRange<T extends number | Date>(
  range: T[]
): SearchRangeType<T> {
  const [start, end] = range;
  return end
    ? {
        searchRange: Between(start, end),
      }
    : {
        searchRange: start,
      };
}

export function getLastMayorInAccounts<T extends { account: { code: string } }>(
  items: T[]
): T[] {
  const lastItemInAccounts = new Map<string, T>();

  for (const item of items) {
    if (!lastItemInAccounts.get(item.account.code)) {
      lastItemInAccounts.set(item.account.code, item);
    }
  }

  return Array.from(lastItemInAccounts.values());
}
