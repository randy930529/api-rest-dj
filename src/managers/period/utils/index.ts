import * as moment from "moment";
import { appConfig } from "../../../../config";
import { Account } from "../../../entity/Account";
import { Mayor } from "../../../entity/Mayor";
import { FiscalYear } from "../../../entity/FiscalYear";
import {
  getAccountOfThePatrimony,
  isMayorPatrimony,
} from "../../accounting/utils";

export const defaultSectionDataInit = (): string => {
  const { MEa_By_MFP } = appConfig.accountingConstants;
  const data = {
    1: {
      data: {},
      totals: {},
    },
    2: {
      data: { F12: MEa_By_MFP },
    },
    3: {
      data: {},
    },
    4: {
      data: {},
    },
    5: {
      data: {},
    },
    6: {
      data: {},
    },
    7: {
      data: {},
      totals: {},
    },
    8: {
      data: {},
      totals: {},
    },
    9: {
      data: {},
      totals: {},
    },
  };
  return JSON.stringify(data);
};

export function getInitialBalances(
  acountInitials: Account[],
  mayors: Mayor[],
  fiscalYear: FiscalYear
): Mayor[] {
  const accountPatrimony = getAccountOfThePatrimony(acountInitials);
  return acountInitials
    .map((account) => {
      const existingMayor = mayors.find(
        ({ account: accountMayor }) => accountMayor?.code === account.code
      );

      if (existingMayor) {
        return existingMayor;
      }

      return Mayor.create({
        date: moment(`${fiscalYear.year - 1}-12-31`).toDate(),
        saldo: 0,
        init_saldo: true,
        voucherDetail: {
          debe: 0,
          haber: 0,
          account,
        },
        account,
        fiscalYear,
      });
    })
    .filter(({ account: accountMayor }) =>
      isMayorPatrimony(accountMayor?.code, accountPatrimony.code)
    );
}
