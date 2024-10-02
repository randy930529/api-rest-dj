import { Profile } from "../../../../entity/Profile";

export type AccountDTO = {
  code: string;
  description: string;
  type?: string;
  moneda?: string;
  acreedor?: boolean;
  profile?: Profile;
};
