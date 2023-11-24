import { NextFunction, Request, Response } from "express";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { responseError } from "../../../errors/responseError";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { LicenseUser } from "../../../entity/LicenseUser";
import { LicenseUserDTO } from "../dto/request/licenseUser.dto";
import { User } from "../../../entity/User";
import { License } from "../../../entity/License";

export class LicenseUserController extends EntityControllerBase<LicenseUser> {
  constructor() {
    const repository = AppDataSource.getRepository(LicenseUser);
    super(repository);
  }

  async createLicenseUser(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: LicenseUserDTO = req.body;
      const userId = fields.user.id;
      const licenseId = fields.license.id;

      if (!userId) responseError(res, "Do must provide a valid user id.", 404);

      if (!licenseId)
        responseError(res, "Do must provide a valid license id.", 404);

      const userRepository = AppDataSource.getRepository(User);
      const licenseRepository = AppDataSource.getRepository(License);

      const user = await userRepository.findOne({
        where: { id: userId },
      });

      const license = await licenseRepository.findOne({
        where: { id: licenseId },
      });

      if (!user) responseError(res, "User not found.", 404);

      if (!license) responseError(res, "License not found.", 404);

      const objectLicenseUser = Object.assign(new LicenseUser(), {
        user,
        license,
      });

      const newLicenseUser = await this.create(objectLicenseUser);

      const licenseUser: LicenseUserDTO = newLicenseUser;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { licenseUser },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onLicenseUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, req, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateLicenseUser(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: LicenseUser = req.body;
      const { id } = req.body;

      if (!id)
        responseError(res, "Update license user requiere id valid.", 404);

      const licenseUserUpdate = await this.update({ id, res }, fields);

      const licenseUser: LicenseUserDTO = licenseUserUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { licenseUser },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async partialUpdateLicenseUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const fields: LicenseUserDTO = req.body;
      const { id } = req.body;

      if (!id)
        responseError(res, "Update license user requiere id valid.", 404);

      const fieldToUpdate: string = Object.keys(fields)[1];
      const licenseUserToUpdate = await this.one({ id, req, res });

      const licenseUserUpdateObject = Object.assign(new LicenseUser(), {
        ...licenseUserToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      });

      const licenseUserUpdate = await this.update(
        { id, res },
        licenseUserUpdateObject
      );

      const licenseUser: LicenseUserDTO = licenseUserUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { licenseUser },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteLicenseUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id)
        responseError(res, "Delete license user requiere id valid.", 404);

      await this.delete({ id, res });

      res.status(204);
      return "License user has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
