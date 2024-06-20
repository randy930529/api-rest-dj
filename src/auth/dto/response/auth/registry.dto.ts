import { BaseResponseDTO } from "../base.dto";
import { UserDTO } from "./user.dto";

export type RegistryDTO = BaseResponseDTO & {
  data: {
    token: string;
    confirUrl: string;
    user: UserDTO;
  };
};
