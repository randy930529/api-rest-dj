import { Enterprise } from "../../../entity/Enterprise";
import { Profile } from "../../../entity/Profile";

export type ProfileEnterpriseDTO = {
  amount: number;
  import: number;
  enterprise: Enterprise;
  profile?: Profile;
};
