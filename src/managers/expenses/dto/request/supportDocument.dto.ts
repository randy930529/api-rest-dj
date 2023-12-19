import { Element } from "../../../../entity/Element";
import { FiscalYear } from "../../../../entity/FiscalYear";

export type SupportDocumentDTO = {
  description: string;
  document?: string;
  amount: number;
  date: Date;
  type_document: string;
  is_bank: boolean;
  element: Element;
  fiscalYear: FiscalYear;
};
