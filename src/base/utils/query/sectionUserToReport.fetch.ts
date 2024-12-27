import { SectionState } from "../../../entity/SectionState";

export async function getSectionUserToReport(
  userId: number
): Promise<SectionState> {
  const existToSectionUser = await SectionState.findOne({
    select: { fiscalYear: { id: true, year: true }, profile: { id: true } },
    relations: ["profile", "fiscalYear"],
    where: {
      user: {
        id: userId,
      },
    },
  });

  if (!existToSectionUser) throw new Error("Section User to report not found.");
  return existToSectionUser;
}
