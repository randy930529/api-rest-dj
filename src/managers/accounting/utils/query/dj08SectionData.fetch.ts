import { Dj08SectionData } from "../../../../entity/Dj08SectionData";

export async function getDJ08SectionsData(
  fiscalYearId: number
): Promise<Dj08SectionData> {
  return await Dj08SectionData.findOne({
    where: {
      dJ08: { fiscalYear: { id: fiscalYearId } },
      is_rectification: true,
    },
  });
}
