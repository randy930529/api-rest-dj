import { FiscalYear } from "../../../../entity/FiscalYear";
import { ProfileActivity } from "../../../../entity/ProfileActivity";
import { SupportDocument } from "../../../../entity/SupportDocument";
import { FISCAL_YEAR_RELATIONS, FISCAL_YEAR_SELECT } from "./fiscalYear.fetch";

export async function getDocumentsFiscalYearOrOfTheProfileActivity(
  fiscalYearId: number,
  type: string,
  profileActivities: ProfileActivity[]
): Promise<SupportDocument[]> {
  if (type === "g" || type === "i") {
    return getDocumentsOfTheProfileActivity(profileActivities);
  }
  return await getDocumentsOfTheFiscalYear(fiscalYearId, type);
}

export async function getDocumentsOfTheFiscalYear(
  fiscalYearId: number,
  type: string
): Promise<SupportDocument[]> {
  const findFiscalYear = await FiscalYear.findOne({
    select: FISCAL_YEAR_SELECT,
    relations: FISCAL_YEAR_RELATIONS,
    where: {
      id: fiscalYearId,
      supportDocuments: {
        type_document: type,
      },
    },
  });

  if (!findFiscalYear) return [];

  return findFiscalYear.supportDocuments;
}

function getDocumentsOfTheProfileActivity(
  profileActivities: ProfileActivity[]
): SupportDocument[] {
  // return profileActivities.reduce<SupportDocument[]>(
  //     (documents, activity) => {
  //       documents = [...documents, ...activity.supportDocuments];
  //       return documents;
  //     },
  //     []
  //   );
  return profileActivities
    .map(({ supportDocuments }) => supportDocuments)
    .flat();
}
