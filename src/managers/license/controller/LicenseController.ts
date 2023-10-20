import { NextFunction, Request, Response } from "express";
import BaseResponseDTO from "../../../auth/dto/response/base.dto";
import { responseError } from "../../../auth/utils/responseError";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { License } from "../../../entity/License";
import { LicenseDTO } from "../dto/request/license.dto";
import { CreateLicenseDTO } from "../dto/response/createLicense.dto";

export class LicenseController extends EntityControllerBase<License> {
  constructor() {
    const repository = AppDataSource.getRepository(License);
    super(repository);
  }

  async createLicense(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    try {
      const body: LicenseDTO = request.body;

      const newLicense = Object.assign(new License(), {
        ...body,
      });

      await this.create(newLicense);

      const license: CreateLicenseDTO = newLicense;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { license },
      };

      response.status(200);
      return { ...resp };
    } catch (error) {
      if (response.statusCode === 200) response.status(500);
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

  async onLicense(request: Request, response: Response, next: NextFunction) {
    try {
      const id = parseInt(request.params.id);

      return await this.one({ id, res: response });
    } catch (error) {
      if (response.statusCode === 200) response.status(500);
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

  async updateLicense(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    try {
      const body: License = request.body;
      const { id } = body;

      if (!id)
        responseError(response, "Delete license requiere id valid.", 404);

      const licenseUpdate = await this.update({ id, res: response }, body);

      const license: CreateLicenseDTO = licenseUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { license },
      };

      response.status(201);
      return { ...resp };
    } catch (error) {
      if (response.statusCode === 200) response.status(500);
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

  async partialUpdateLicense(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    try {
      const body: LicenseDTO = request.body;
      const { id } = request.body;

      if (!id)
        responseError(response, "Delete license requiere id valid.", 404);

      const fieldToUpdate: string = Object.keys(body)[1];
      const licenseToUpdate = await this.one({ id, res: response });

      const licenseUpdate = Object.assign(new License(), {
        ...licenseToUpdate,
        [fieldToUpdate]: body[fieldToUpdate],
      });

      await this.update({ id, res: response }, licenseUpdate);

      const license: CreateLicenseDTO = licenseUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { license },
      };

      response.status(200);
      return { ...resp };
    } catch (error) {
      if (response.statusCode === 200) response.status(500);
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

  async deleteLicense(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    try {
      const id = parseInt(request.params.id);

      if (!id)
        responseError(response, "Delete license requiere id valid.", 404);

      await this.delete({ id, res: response });

      response.status(204);
      return "License has been removed successfully.";
    } catch (error) {
      if (response.statusCode === 200) response.status(500);
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
