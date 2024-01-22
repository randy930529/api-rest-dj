import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { Profile } from "../../entity/Profile";
import { ProfileDTO } from "../dto/request/profile.dto";
import { responseError } from "../../errors/responseError";
import { User } from "../../entity/User";
import { JWT } from "../../auth/security/jwt";
import { BaseResponseDTO } from "../../auth/dto/response/base.dto";
import { CreateProfileDTO } from "../dto/response/createProfile.dto";
import { EntityControllerBase } from "../../base/EntityControllerBase";

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

      const newProfile = this.repository.create({ ...fields, user });
      await this.repository.save(newProfile);

      const profile: CreateProfileDTO = newProfile;
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
        },
        where: { id },
      });

      if (profileToUpdate.user.id !== userId)
        responseError(
          res,
          "User is not authorized to update this profile.",
          401
        );

      const profileUpdate = this.repository.create({
        ...profileToUpdate,
        ...fields,
      });
      await this.repository.save(profileUpdate);

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
      const fields: ProfileDTO = req.body;
      console.log(fields);
      const { id, token } = req.body;
      const userId = JWT.getJwtPayloadValueByKey(token, "id");

      if (!id)
        responseError(res, "Update profile requiere profile id valid.", 401);

      const fieldToUpdate: string = Object.keys(fields)[1];

      const profileToUpdate = await this.repository.findOne({
        relations: {
          user: true,
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

      const profileUpdate = {
        ...profileToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      };
      await this.repository.save(profileUpdate);

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
