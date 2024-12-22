import { NextFunction, Request, Response } from "express";
import * as pug from "pug";
import * as path from "path";
import { AppDataSource } from "../../data-source";
import { EntityControllerBase } from "../../base/EntityControllerBase";
import { Config } from "../../entity/Config";
import { BaseResponseDTO } from "../../auth/dto/response/base.dto";
import { responseError } from "../../errors/responseError";
import { UpdateConfigDTO } from "../dto/updateConfig.dto";
import { CreateConfigDTO } from "../../api/dto/createConfig.dto";

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

  async createConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: CreateConfigDTO = req.body;

      const configCreate = this.generateConfig(fields);
      const configCreated = await this.create(configCreate);

      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { config: configCreated },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: UpdateConfigDTO = req.body;
      if (!fields.id)
        responseError(res, "Update api config requiere id valid.", 404);

      const configToUpdateCreate = this.generateConfig(fields);
      const configUpdate = await this.update(
        { id: fields.id, res },
        configToUpdateCreate
      );

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

  private generateConfig(fields: CreateConfigDTO | UpdateConfigDTO): Config {
    fields.progressiveScale = this.updateTramoNumber(fields.progressiveScale);

    return this.repository.create({
      ...fields,
      company: JSON.stringify(fields.company),
      mora_scale: JSON.stringify(fields.mora_scale),
    });
  }

  private updateTramoNumber(
    fieldsScale: {
      id?: number;
      is_normal: boolean;
      tramo?: number;
      from: number;
      to: number;
      porcentage: number;
    }[]
  ) {
    return fieldsScale.map((val, index) => ({ ...val, tramo: index + 1 }));
  }
}
