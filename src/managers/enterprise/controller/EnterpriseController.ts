import { AppDataSource } from "../../../data-source";
import { NextFunction, Request, Response } from "express";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { Enterprise } from "../../../entity/Enterprise";
import { responseError } from "../../../errors/responseError";
import { EnterpriseDTO } from "../dto/enterprise.dto";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { User } from "../../../entity/User";

export class EnterpriseController extends EntityControllerBase<Enterprise> {
  constructor() {
    const repository = AppDataSource.getRepository(Enterprise);
    super(repository);
  }

  async createEnterprise(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: EnterpriseDTO = req.body;
      const { id } = fields.user;

      const user = await User.findOneBy({ id });

      const objectEnterprise = Object.assign(new Enterprise(), {
        ...fields,
        user,
      });

      const newEnterprise = await this.create(objectEnterprise);

      const enterprise: EnterpriseDTO = newEnterprise;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { enterprise },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onEnterprise(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, req, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateEnterprise(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: Enterprise = req.body;
      const { id } = fields;

      if (!id) responseError(res, "Update enterprise requiere id valid.", 404);

      const enterpriseUpdate = await this.update({ id, res }, fields);

      const enterprise: EnterpriseDTO = enterpriseUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { enterprise },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteEnterprise(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id) responseError(res, "Delete enterprise requiere id valid.", 404);

      await this.delete({ id, res });

      res.status(204);
      return "Enterprise has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
