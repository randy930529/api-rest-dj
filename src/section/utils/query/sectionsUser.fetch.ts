import { FindOptionsSelect, FindOptionsRelations, Repository } from "typeorm";
import { SectionState } from "../../../entity/SectionState";

export const SECTION_SELECT: FindOptionsSelect<SectionState> = {
  fiscalYear: {
    id: true,
    year: true,
    date: true,
    general_scheme: true,
    declared: true,
    individual: true,
    has_documents: true,
    date_last_document: true,
    musicalGroup: {
      id: true,
      description: true,
      number_members: true,
    },
    regimen: true,
    is_tcp: true,
    run_acounting: true,
    balanced: true,
    created_at: true,
    updated_at: true,
    supportDocuments: {
      id: true,
      document: true,
      amount: true,
      type_document: true,
      element: {
        id: true,
        group: true,
      },
    },
    dj08: {
      id: true,
      dj08SectionData: {
        id: true,
        section_data: true,
        is_rectification: true,
      },
    },
  },
};

export const SECTION_RELATIONS: FindOptionsRelations<SectionState> = {
  profile: {
    address: { address: true },
    profileActivity: {
      activity: true,
    },
  },
  fiscalYear: {
    musicalGroup: true,
    supportDocuments: { element: true },
    dj08: { dj08SectionData: true },
    profileActivities: {
      activity: true,
    },
  },
  licenseUser: { license: true },
};

export async function getExistToSectionUser(
  userId: number,
  repository: Repository<SectionState>
): Promise<SectionState> {
  return await repository.findOne({
    select: SECTION_SELECT,
    relations: SECTION_RELATIONS,
    where: {
      user: {
        id: userId,
      },
    },
  });
}
