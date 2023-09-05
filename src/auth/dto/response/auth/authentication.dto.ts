import BaseResponseDTO from "../base.dto";
import { UserDTO } from "./user.dto";

export class AuthenticationDTO extends BaseResponseDTO {
  data: {
    token: string;
    refreshToken: string;
    user: UserDTO;
  };
}
