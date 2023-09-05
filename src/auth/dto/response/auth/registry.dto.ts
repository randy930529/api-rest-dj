import BaseResponseDTO from "../base.dto";
import { UserDTO } from "./user.dto";

export class RegistryDTO extends BaseResponseDTO {
  data: {
    token: string;
    confirUrl: string;
    user: UserDTO;
  };
}
