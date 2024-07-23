import { NextFunction, Request, Response } from "express";
import { FindManyOptions } from "typeorm";
import { DJ08 } from "../../entity/DJ08";
import { EntityControllerBase } from "../../base/EntityControllerBase";
import { AppDataSource } from "../../data-source";
import { createFindOptions } from "../../base/utils/createFindOptions";
import { User } from "../../entity/User";
import { responseError } from "../../errors/responseError";
import { BaseResponseDTO } from "../../auth/dto/response/base.dto";

export class DJ08Controller extends EntityControllerBase<DJ08> {
  constructor() {
    const repository = AppDataSource.getRepository(DJ08);
    super(repository);
  }

  async allDJ08(req: Request, res: Response, next: NextFunction) {
    try {
      const { body, query } = req;

      const { user }: { user: User } = body;

      if (user.role !== "admin") {
        const options: FindManyOptions<DJ08> = createFindOptions(req);
        const { where } = options;

        options["where"] = { ...where, profile: { user: { id: user.id } } };

        req.query = {
          ...query,
          options: JSON.stringify(options),
        };
      }

      await this.all(req, res, next);
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateDJ08(req: Request, res: Response, next: NextFunction) {
    try {
      const fields = req.body;

      if (!fields.id)
        responseError(res, "Reset dj08 requiere fiscal year id valid.", 404);

      const dj08ToUpdate = await DJ08.findOne({
        relations: { dj08SectionData: true, fiscalYear: {musicalGroup:true} },
        where: { fiscalYear: { id: fields.id } },
      });

      const dj08DeclaredToRemove = dj08ToUpdate?.dj08SectionData.find(
        (val) => !val.is_rectification
      );

      await dj08DeclaredToRemove?.remove();
      if (dj08ToUpdate) {
        dj08ToUpdate.fiscalYear.declared = false;
        await dj08ToUpdate.fiscalYear.save();
      }

      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: {},
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
