import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { Account } from "../../../../entity/Account";

export const BALANCES_ACCOUNT_SELECT: FindOptionsSelect<Account> = {
  mayors: {
    id: true,
    date: true,
    init_saldo: true,
    saldo: true,
    voucherDetail: {
      id: true,
      debe: true,
      haber: true,
      account: {
        id: true,
        code: true,
        description: true,
        acreedor: true,
      },
    },
    fiscalYear: {
      id: true,
      year: true,
    },
  },
};

export const BALANCES_ACCOUNT_RELATIONS: FindOptionsRelations<Account> = {
  mayors: { voucherDetail: { account: true }, fiscalYear: true },
};
