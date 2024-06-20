import { AccountDTO } from "../request/account.dto";

export type CreateAccountDTO = AccountDTO & {
  id: number;
};
