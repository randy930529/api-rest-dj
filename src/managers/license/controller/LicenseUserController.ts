import { NextFunction, Request, Response } from "express";
import * as moment from "moment";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { responseError } from "../../../errors/responseError";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { LicenseUser } from "../../../entity/LicenseUser";
import { LicenseUserDTO } from "../dto/request/licenseUser.dto";
import { User } from "../../../entity/User";
import { License } from "../../../entity/License";
import { CreateLicenseUserDTO } from "../dto/response/createLicenseUserDTO.dto";
import { TMBill } from "../../../entity/TMBill";
import { StateTMBill } from "../../../entity/StateTMBill";
import { stateTMBillRoutes } from "../../bills/routes/stateTMBill";

const PAY_NOTIFICATION_URL = (serverName, endpoint) =>
  `${serverName}${endpoint}`;

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

      const user = await User.findOne({
        where: { id: userId },
      });

      const license = await License.findOne({
        where: { id: licenseId },
      });

      if (!user) responseError(res, "User not found.", 404);

      if (!license) responseError(res, "License not found.", 404);

      let expirationDate: Date;
      if (license.days)
        expirationDate = moment().add(license.days, "d").toDate();

      const tmBillDTO = await TMBill.create({
        ...fields.tmBill,
        import: license.import,
      });

      const stateTMBillDTO = await StateTMBill.create({
        description: tmBillDTO.description || "",
        tmBill: tmBillDTO,
      });

      const stateTMBill = await stateTMBillDTO.save();
      const tmBill = stateTMBill.tmBill;

      const objectLicenseUser = Object.assign(new LicenseUser(), {
        ...fields,
        user,
        license,
        expirationDate,
        tmBill,
      });

      const newLicenseUser = await this.create(objectLicenseUser);

      const licenseUser: CreateLicenseUserDTO = {
        ...newLicenseUser,
        user: undefined,
        expirationDate: undefined,
        UrlResponse: PAY_NOTIFICATION_URL(
          "localhost:4000",
          stateTMBillRoutes[0].route
        ),
      };
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

      const licenseUser: LicenseUser = await this.one({ id, req, res });

      return licenseUser;
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
