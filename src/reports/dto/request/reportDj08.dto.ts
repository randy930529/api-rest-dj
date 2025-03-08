import { User } from "../../../entity/User";

export type CreateReportDj08DTO = {
  declared: boolean;
  date?: Date;
  user: User;
};
