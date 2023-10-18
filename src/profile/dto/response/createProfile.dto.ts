import { User } from "../../../entity/User";

export class CreateProfileDTO {
  id: number;
  nombre: string;
  last_name: string;
  ci: string;
  nit: string;
  address: string;
  user: User;
}
