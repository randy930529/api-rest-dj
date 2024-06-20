import { BaseResponseDTO } from "../base.dto";
import { UserDTO } from "./user.dto";

export type AuthenticationDTO = BaseResponseDTO & {
  data: {
    token: string;
    refreshToken: string;
    user: UserDTO;
  };
};
