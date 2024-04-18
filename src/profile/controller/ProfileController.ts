import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import * as moment from "moment";
import { Profile } from "../../entity/Profile";
import { ProfileDTO } from "../dto/request/profile.dto";
import { responseError } from "../../errors/responseError";
import { User } from "../../entity/User";
import { JWT } from "../../auth/security/jwt";
import { BaseResponseDTO } from "../../auth/dto/response/base.dto";
import { CreateProfileDTO } from "../dto/response/createProfile.dto";
import { EntityControllerBase } from "../../base/EntityControllerBase";
import { FiscalYear } from "../../entity/FiscalYear";
import { ProfileAddress } from "../../entity/ProfileAddress";

export class ProfileController extends EntityControllerBase<Profile> {
  constructor() {
    const repository = AppDataSource.getRepository(Profile);
    super(repository);
  }

  async createProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: ProfileDTO = req.body;
      const { user }: { user: User } = req.body;

      if (!user.active) {
        responseError(res, "User not activate.", 401);
      }

      const countProfiles: number = await Profile.countBy({
        user: { id: user.id },
      });

      if (countProfiles >= user.max_profiles) {
        responseError(
          res,
          "This user excede the max profiles to current licese.",
          400
        );
      }

      const newProfileDTO = this.repository.create({ ...fields, user });
      const newProfile = await this.repository.save(newProfileDTO);

      const date = moment().startOf("year").toDate();
      const year = moment().year();

      const newFiscalYear = FiscalYear.create({
        year,
        date,
        profile: newProfile,
      });
      await FiscalYear.save(newFiscalYear);

      const profile: CreateProfileDTO = newProfileDTO;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profile },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, req, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: ProfileDTO = req.body;
      const { id, token } = req.body;
      const userId = JWT.getJwtPayloadValueByKey(token, "id");

      if (!id)
        responseError(res, "Update profile requiere profile id valid.", 404);

      const profileToUpdate = await this.repository.findOne({
        relations: {
          user: true,
          address: { address: true },
        },
        where: { id },
      });

      if (profileToUpdate.user.id !== userId)
        responseError(
          res,
          "User is not authorized to update this profile.",
          401
        );

      const fieldsToProfileUpdate = this.repository.create({
        ...profileToUpdate,
        ...fields,
      });
      const profileUpdate = await this.repository.save(fieldsToProfileUpdate);

      const profile: ProfileDTO = profileUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profile },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async partialUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      let fields: ProfileDTO = req.body;
      const { id, token } = req.body;
      const userId = JWT.getJwtPayloadValueByKey(token, "id");

      if (!id)
        responseError(res, "Update profile requiere profile id valid.", 401);

      const fieldToUpdate: string = Object.keys(fields)[1];

      const profileToUpdate = await this.repository.findOne({
        relations: {
          user: true,
          address: { address: true },
        },
        where: { id },
      });

      if (!profileToUpdate) {
        responseError(res, "User does not exist.", 404);
      }

      if (profileToUpdate.user.id !== userId)
        responseError(
          res,
          "User is not authorized to update this profile.",
          401
        );

      if (!profileToUpdate.address && fieldToUpdate === "address") {
        const address = ProfileAddress.create(fields.address);
        await address.save();
        fields = { ...fields, address };
      }

      const fieldToProfileUpdate = {
        ...profileToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      };
      const profileUpdate = await this.repository.save(fieldToProfileUpdate);

      const profile: ProfileDTO = profileUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profile },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id)
        responseError(res, "Delete profile requiere profile id valid.", 404);

      await this.delete({ id, res });

      res.status(204);
      return "Profile has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
