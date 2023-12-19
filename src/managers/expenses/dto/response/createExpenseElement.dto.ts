import { ElementDTO } from "../request/element.dto";

export type CreateExpenseElementDTO = ElementDTO & {
  id: number;
};
