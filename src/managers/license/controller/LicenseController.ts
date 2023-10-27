import { NextFunction, Request, Response } from "express";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { responseError } from "../../../errors/responseError";
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

  async createLicense(req: Request, res: Response, next: NextFunction) {
    try {
      const body: LicenseDTO = req.body;

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

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onLicense(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateLicense(req: Request, res: Response, next: NextFunction) {
    try {
      const body: License = req.body;
      const { id } = body;

      if (!id) responseError(res, "Delete license requiere id valid.", 404);

      const licenseUpdate = await this.update({ id, res }, body);

      const license: CreateLicenseDTO = licenseUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { license },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async partialUpdateLicense(req: Request, res: Response, next: NextFunction) {
    try {
      const body: LicenseDTO = req.body;
      const { id } = req.body;

      if (!id) responseError(res, "Delete license requiere id valid.", 404);

      const fieldToUpdate: string = Object.keys(body)[1];
      const licenseToUpdate = await this.one({ id, res });

      const licenseUpdate = Object.assign(new License(), {
        ...licenseToUpdate,
        [fieldToUpdate]: body[fieldToUpdate],
      });

      await this.update({ id, res }, licenseUpdate);

      const license: CreateLicenseDTO = licenseUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { license },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteLicense(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id) responseError(res, "Delete license requiere id valid.", 404);

      await this.delete({ id, res });

      res.status(204);
      return "License has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
