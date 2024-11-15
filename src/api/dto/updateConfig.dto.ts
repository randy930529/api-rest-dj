import { CreateConfigDTO } from "./createConfig.dto";

export type UpdateConfigDTO = CreateConfigDTO & {
  id: number;
};
