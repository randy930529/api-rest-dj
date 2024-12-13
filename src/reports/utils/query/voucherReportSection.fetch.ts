import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { SectionState } from "../../../entity/SectionState";

export const SECTION_SELECT: FindOptionsSelect<SectionState> = {
  profile: {
    id: true,
    first_name: true,
    last_name: true,
    nit: true,
  },
  fiscalYear: {
    id: true,
  },
};

export const SECTION_RELATIONS: FindOptionsRelations<SectionState> = {
  profile: true,
  fiscalYear: true,
};

export async function getUserSectionToReport(
  userId: number
): Promise<SectionState> {
  return await SectionState.findOne({
    select: SECTION_SELECT,
    relations: SECTION_RELATIONS,
    where: { user: { id: userId } },
  });
}
