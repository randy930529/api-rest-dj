import { NextFunction, Request, Response } from "express";
import BaseResponseDTO from "../../../auth/dto/response/base.dto";
import { responseError } from "../../../auth/utils/responseError";
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
      const body: LicenseUserDTO = req.body;
      const userId = body.user.id;
      const licenseId = body.license.id;

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

      const newLicenseUser = Object.assign(new LicenseUser(), {
        user,
        license,
      });

      await this.create(newLicenseUser);

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
      const resp: BaseResponseDTO = {
        status: "fail",
        error: {
          message: error.message,
        },
        data: undefined,
      };
      return {
        ...resp,
      };
    }
  }

  async onLicenseUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      const resp: BaseResponseDTO = {
        status: "fail",
        error: {
          message: error.message,
        },
        data: undefined,
      };
      return {
        ...resp,
      };
    }
  }

  async updateLicenseUser(req: Request, res: Response, next: NextFunction) {
    try {
      const body: LicenseUser = req.body;
      const { id } = req.body;

      if (!id)
        responseError(res, "Update license user requiere id valid.", 404);

      const licenseUserUpdate = await this.update({ id, res }, body);

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
      const resp: BaseResponseDTO = {
        status: "fail",
        error: {
          message: error.message,
        },
        data: undefined,
      };
      return {
        ...resp,
      };
    }
  }

  async partialUpdateLicenseUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const body: LicenseUserDTO = req.body;
      const { id } = req.body;

      if (!id)
        responseError(res, "Update license user requiere id valid.", 404);

      const fieldToUpdate: string = Object.keys(body)[1];
      const licenseUserToUpdate = await this.one({ id, res });

      const licenseUserUpdate = Object.assign(new LicenseUser(), {
        ...licenseUserToUpdate,
        [fieldToUpdate]: body[fieldToUpdate],
      });

      await this.update({ id, res }, licenseUserUpdate);

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
      const resp: BaseResponseDTO = {
        status: "fail",
        error: {
          message: error.message,
        },
        data: undefined,
      };
      return {
        ...resp,
      };
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
      const resp: BaseResponseDTO = {
        status: "fail",
        error: {
          message: error.message,
        },
        data: undefined,
      };
      return {
        ...resp,
      };
    }
  }
}