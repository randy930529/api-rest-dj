import { ExpenseElementDTO } from "../request/expenseElement.dto";

export type CreateExpenseElementDTO = ExpenseElementDTO & {
  id: number;
};
