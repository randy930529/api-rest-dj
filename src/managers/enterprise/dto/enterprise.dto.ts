import { User } from "../../../entity/User";

export type EnterpriseDTO = {
  name: string;
  sector: string;
  is_general?: boolean;
  user?: User;
};
