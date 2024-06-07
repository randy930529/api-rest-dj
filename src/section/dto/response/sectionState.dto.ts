import { SectionStateDTO } from "../request/sectionState.dto";

export type UserSectionStateDTO = SectionStateDTO & {
  has_cultural_activity: boolean;
  expenses_without_document: number;
  expenses_with_document: number;
  current_tax_debt: number;
};
