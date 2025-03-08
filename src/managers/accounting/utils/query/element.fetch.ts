import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { Element } from "../../../../entity/Element";

export const ELEMENT_SELECT: FindOptionsSelect<Element> = {
  account: { id: true, acreedor: true },
};

export const ELEMENT_RELATIONS: FindOptionsRelations<Element> = {
  account: true,
};
