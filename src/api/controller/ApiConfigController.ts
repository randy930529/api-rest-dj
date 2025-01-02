import { NextFunction, Request, Response } from "express";
import * as pug from "pug";
import * as path from "path";
import { AppDataSource } from "../../data-source";
import { EntityControllerBase } from "../../base/EntityControllerBase";
import { Config } from "../../entity/Config";
import { BaseResponseDTO } from "../../auth/dto/response/base.dto";
import { responseError } from "../../errors/responseError";
import { UpdateConfigDTO } from "../dto/updateConfig.dto";

export class ApiConfigController extends EntityControllerBase<Config> {
  constructor() {
    const repository = AppDataSource.getRepository(Config);
    super(repository);
  }

  async apiHome(req: Request, res: Response, next: NextFunction) {
    const filePath = path.join(__dirname, `../../utils/views/api/index.pug`);
    const options = {
      title: "API-rest dj",
      url: "logo.empresa",
    };
    const html = pug.renderFile(filePath, options);

    res.send(html);
  }

  async staticMediaFiles(req: Request, res: Response, next: NextFunction) {
    const { type, file } = req.params;
    const filePath = path.join(
      __dirname,
      "../../../public",
      `${type ? `${type}/` : ``}`,
      file
    );

    res.sendFile(filePath);
  }

  async updateConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: Config = req.body;
      const { id } = fields;

      if (!id) responseError(res, "Update api config requiere id valid.", 404);

      const configUpdate = await this.update({ id, res }, fields);

      process.env.MEa_By_MFP = `${configUpdate.MEa_By_MFP}`;
      process.env.PPD_PERCENTAGE = `${configUpdate.PPD_PERCENTAGE}`;
      process.env.PE_0_10000 = `${configUpdate.PE_0_10000}`;
      process.env.PE_10000_20000 = `${configUpdate.PE_10000_20000}`;
      process.env.PE_20000_30000 = `${configUpdate.PE_20000_30000}`;
      process.env.PE_30000_50000 = `${configUpdate.PE_30000_50000}`;
      process.env.PE_ABOVE_50000 = `${configUpdate.PE_ABOVE_50000}`;

      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { config: configUpdate },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async partialConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: UpdateConfigDTO = req.body;
      const { id } = fields;

      if (!id) responseError(res, "Update config requiere id valid.", 404);

      const fieldToUpdate: string = Object.keys(fields)[1];

      const configToUpdate = await this.one({ id, req, res });

      const configUpdateObject = Object.assign(new Config(), {
        ...configToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      });

      const configUpdate = await this.update({ id, res }, configUpdateObject);
      process.env[fieldToUpdate] = `${configUpdate[fieldToUpdate]}`;

      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { config: configUpdate },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
