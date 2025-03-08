import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { ProfileActivity } from "../../../../entity/ProfileActivity";

export const PROFILE_ACTIVITIES_SELECT: FindOptionsSelect<ProfileActivity> = {
  supportDocuments: {
    id: true,
    type_document: true,
    amount: true,
    element: {
      id: true,
      description: true,
      group: true,
      is_general: true,
    },
  },
  activity: { id: true, code: true, description: true },
};

export const PROFILE_ACTIVITIES_RELATIONS: FindOptionsRelations<ProfileActivity> =
  {
    activity: true,
    supportDocuments: { element: true },
  };

export async function getProfileActivities(
  fiscalYearId: number,
  type: string
): Promise<ProfileActivity[]> {
  if (!(type === "g" || type === "i")) return [];

  return await ProfileActivity.find({
    select: PROFILE_ACTIVITIES_SELECT,
    relations: PROFILE_ACTIVITIES_RELATIONS,
    where: {
      supportDocuments: {
        fiscalYear: { id: fiscalYearId },
      },
    },
  });
}
