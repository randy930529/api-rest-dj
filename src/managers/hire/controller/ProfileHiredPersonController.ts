import { NextFunction, Request, Response } from "express";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { ProfileHiredPerson } from "../../../entity/ProfileHiredPerson";
import { ProfileHiredPersonDTO } from "../dto/request/profileHiredPerson.dto";
import { responseError } from "../../../errors/responseError";
import { Profile } from "../../../entity/Profile";
import { HiredPerson } from "../../../entity/HiredPerson";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";

export class ProfileHiredPersonController extends EntityControllerBase<ProfileHiredPerson> {
  constructor() {
    const repository = AppDataSource.getRepository(ProfileHiredPerson);
    super(repository);
  }

  async createProfileHiredPerson(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const body: ProfileHiredPersonDTO = req.body;
      const profileId = body.profile.id;
      const hiredPersonId = body.hiredPerson.id;

      if (!profileId)
        responseError(res, "Do must provide a valid profile id.", 404);

      if (!hiredPersonId)
        responseError(res, "Do must provide a valid hired person id.", 404);

      const profileRepository = AppDataSource.getRepository(Profile);
      const hiredPersonRepository = AppDataSource.getRepository(HiredPerson);

      const profile = await profileRepository.findOne({
        where: { id: profileId },
      });

      const hiredPerson = await hiredPersonRepository.findOne({
        where: { id: hiredPersonId },
      });

      if (!profile) responseError(res, "Profile not found.", 404);

      if (!hiredPerson) responseError(res, "Hired person not found.", 404);

      const newProfileHiredPerson = Object.assign(new ProfileHiredPerson(), {
        ...body,
        profile,
        hiredPerson,
      });

      await this.create(newProfileHiredPerson);

      const profileHiredPerson: ProfileHiredPersonDTO = newProfileHiredPerson;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profileHiredPerson },
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

  async onProfileHiredPerson(req: Request, res: Response, next: NextFunction) {
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

  async updateProfileHiredPerson(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const body: ProfileHiredPerson = req.body;
      const { id } = req.body;

      if (!id)
        responseError(
          res,
          "Update profile hired person requiere profile id valid.",
          404,
        );

      const profileHiredPersonUpdate = await this.update({ id, res }, body);

      const profileHiredPerson: ProfileHiredPersonDTO =
        profileHiredPersonUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profileHiredPerson },
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

  async partialUpdateProfileHiredPerson(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const body: ProfileHiredPersonDTO = req.body;
      const { id } = req.body;

      if (!id)
        responseError(
          res,
          "Update requiere profile hired person id valid.",
          404,
        );

      const fieldToUpdate: string = Object.keys(body)[1];
      const profileHiredPersonToUpdate = await this.one({ id, res });

      const profileHiredPersonUpdate = Object.assign(new ProfileHiredPerson(), {
        ...profileHiredPersonToUpdate,
        [fieldToUpdate]: body[fieldToUpdate],
      });

      await this.update({ id, res }, profileHiredPersonUpdate);

      const profileHiredPerson: ProfileHiredPersonDTO =
        profileHiredPersonUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profileHiredPerson },
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

  async deleteProfileHiredPerson(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = parseInt(req.params.id);

      if (!id)
        responseError(
          res,
          "Delete profile hired person requiere profile id valid.",
          404,
        );

      await this.delete({ id, res });

      res.status(204);
      return "Profile hired person has been removed successfully.";
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
