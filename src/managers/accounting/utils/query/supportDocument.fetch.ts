import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { SupportDocument } from "../../../../entity/SupportDocument";

export const SUPPORT_DOCUMENT_SELECT: FindOptionsSelect<SupportDocument> = {
  element: {
    id: true,
    description: true,
    type: true,
    group: true,
    is_general: true,
    account: { id: true },
  },
  profileActivity: { id: true },
  voucher: {
    id: true,
    number: true,
    voucherDetails: {
      id: true,
      debe: true,
      haber: true,
      account: { id: true },
    },
  },
};

export const SUPPORT_DOCUMENT_RELATIONS: FindOptionsRelations<SupportDocument> =
  {
    element: { account: true },
    profileActivity: true,
    voucher: { voucherDetails: true },
  };
