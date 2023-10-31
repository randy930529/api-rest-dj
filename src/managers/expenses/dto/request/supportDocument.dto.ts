import { ExpenseElement } from "../../../../entity/ExpenseElement";
import { FiscalYear } from "../../../../entity/FiscalYear";

export type SupportDocumentDTO = {
  description: string;
  document?: string;
  amount: number;
  date: string;
  type_document: string;
  is_bank: boolean;
  expenseElement: ExpenseElement;
  fiscalYear: FiscalYear;
};
