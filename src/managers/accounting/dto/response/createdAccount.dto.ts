import { AccountDTO } from "../request/account.dto";

export type CreatedAccountDTO = AccountDTO & {
  id: number;
};
