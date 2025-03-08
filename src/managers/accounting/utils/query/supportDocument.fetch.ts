import { FindOptionsRelations, FindOptionsSelect, Repository } from "typeorm";
import { SupportDocument } from "../../../../entity/SupportDocument";

export const SUPPORT_DOCUMENT_SELECT: FindOptionsSelect<SupportDocument> = {
  element: {
    id: true,
    description: true,
    type: true,
    group: true,
    is_general: true,
    account: { id: true, acreedor: true },
  },
  fiscalYear: {
    id: true,
    year: true,
    date: true,
    run_acounting: true,
    individual: true,
    musicalGroup: { id: true },
  },
  profileActivity: { id: true },
  voucher: {
    id: true,
    number: true,
    voucherDetails: {
      id: true,
      debe: true,
      haber: true,
      account: { id: true, acreedor: true },
      mayor: {
        id: true,
        account: { id: true, code: true },
      },
    },
  },
};

export const SUPPORT_DOCUMENT_RELATIONS: FindOptionsRelations<SupportDocument> =
  {
    element: { account: true },
    fiscalYear: { musicalGroup: true },
    profileActivity: true,
    voucher: { voucherDetails: { account: true, mayor: { account: true } } },
  };

export async function getSupportDocumentToUpdate(
  id: number,
  repository: Repository<SupportDocument>
): Promise<SupportDocument> {
  return await repository.findOne({
    select: SUPPORT_DOCUMENT_SELECT,
    relations: SUPPORT_DOCUMENT_RELATIONS,
    where: { id },
  });
}

export async function getSupportDocumentToRemove(
  id: number,
  repository: Repository<SupportDocument>
): Promise<SupportDocument> {
  return await repository.findOne({
    select: SUPPORT_DOCUMENT_SELECT,
    relations: SUPPORT_DOCUMENT_RELATIONS,
    where: { id },
  });
}
