import { Element } from "../../../../entity/Element";
import { ProfileActivity } from "../../../../entity/ProfileActivity";

export type UpdateSupportDocumentDTO = {
  id: number;
  description: string;
  document?: string;
  amount: number;
  date: Date;
  type_document: string;
  is_bank: boolean;
  element: Element;
  profileActivity: ProfileActivity;
};
