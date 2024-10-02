import { Element } from "../../../../entity/Element";
import { FiscalYear } from "../../../../entity/FiscalYear";
import { ProfileActivity } from "../../../../entity/ProfileActivity";

export type CreateSupportDocumentDTO = {
  description: string;
  document?: string;
  amount: number;
  date: Date;
  type_document: string;
  is_bank: boolean;
  element: Element;
  fiscalYear: FiscalYear;
  profileActivity?: ProfileActivity;
};
