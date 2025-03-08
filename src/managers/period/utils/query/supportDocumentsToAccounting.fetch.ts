import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { SupportDocument } from "../../../../entity/SupportDocument";

export const DOCUMENTS_TO_ACCOUNTING_SELECT: FindOptionsSelect<SupportDocument> =
  {
    element: {
      id: true,
      group: true,
      account: { id: true, acreedor: true },
    },
  };

export const DOCUMENT_TO_ACCOUNTING_RELATIONS: FindOptionsRelations<SupportDocument> =
  {
    element: { account: true },
  };

export async function getSupportDocumentsToAccounting(
  fiscalYearId: number
): Promise<SupportDocument[]> {
  return await SupportDocument.find({
    select: DOCUMENTS_TO_ACCOUNTING_SELECT,
    relations: DOCUMENT_TO_ACCOUNTING_RELATIONS,
    where: { fiscalYear: { id: fiscalYearId } },
    order: { date: "ASC", id: "ASC" },
  });
}
