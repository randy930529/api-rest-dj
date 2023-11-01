import { Profile } from "../../../../entity/Profile";
import { Tax } from "../../../../entity/Tax";

export type TaxPaidDTO = {
  import: number;
  date: Date;
  profile: Profile;
  tax: Tax;
};
