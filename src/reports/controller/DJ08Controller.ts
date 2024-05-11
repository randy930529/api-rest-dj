import { NextFunction, Request, Response } from "express";
import { FindManyOptions } from "typeorm";
import { DJ08 } from "../../entity/DJ08";
import { EntityControllerBase } from "../../base/EntityControllerBase";
import { AppDataSource } from "../../data-source";
import { createFindOptions } from "../../base/utils/createFindOptions";
import { User } from "../../entity/User";

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
}
