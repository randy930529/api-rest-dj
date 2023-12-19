import { ElementDTO } from "../request/element.dto";

export type CreateElementDTO = ElementDTO & {
  id: number;
};
