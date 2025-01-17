import { SectionState } from "../../../entity/SectionState";

export async function getUserSectionToRemove(
  userId: number
): Promise<SectionState> {
  return await SectionState.findOneBy({
    user: { id: userId },
  });
}
