import { CreateSupportDocumentDTO } from "../request/createSupportDocument.dto";

export type CreatedSupportDocumentDTO = CreateSupportDocumentDTO & {
  id: number;
};
