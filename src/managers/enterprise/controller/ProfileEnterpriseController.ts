import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../../../data-source";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { ProfileEnterprise } from "../../../entity/ProfileEnterprise";
import { ProfileEnterpriseDTO } from "../dto/profileEnterprise.dto";
import { Profile } from "../../../entity/Profile";
import { Enterprise } from "../../../entity/Enterprise";
import { responseError } from "../../../errors/responseError";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";

export class ProfileEnterpriseController extends EntityControllerBase<ProfileEnterprise> {
  constructor() {
    const repository = AppDataSource.getRepository(ProfileEnterprise);
    super(repository);
  }

  async createProfileEnterprise(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const fields: ProfileEnterpriseDTO = req.body;
      const { id } = fields.profile;
      const { id: enterpriseID } = fields.enterprise;

      const profile = await Profile.findOneBy({ id });
      const enterprise = await Enterprise.findOneBy({ id: enterpriseID });

      if (!enterprise) responseError(res, "Enterprise requiere id valid.", 404);

      const objectProfileEnterprise = Object.assign(new ProfileEnterprise(), {
        ...fields,
        enterprise,
        profile,
      });

      const newProfileEnterprise = await this.create(objectProfileEnterprise);

      const profileEnterprise: ProfileEnterpriseDTO = newProfileEnterprise;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profileEnterprise },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onProfileEnterprise(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, req, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateProfileEnterprise(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const fields: ProfileEnterprise = req.body;
      const { id } = fields;

      if (!id)
        responseError(res, "Update profile enterprise requiere id valid.", 404);

      const profileEnterpriseUpdate = await this.update({ id, res }, fields);

      const profileEnterprise: ProfileEnterpriseDTO = profileEnterpriseUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profileEnterprise },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteProfileEnterprise(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = parseInt(req.params.id);

      if (!id)
        responseError(res, "Delete profile enterprise requiere id valid.", 404);

      await this.delete({ id, res });

      res.status(204);
      return "Profile enterprise has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
