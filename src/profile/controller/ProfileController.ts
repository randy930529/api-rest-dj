import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { Profile } from "../../entity/Profile";
import { ProfileDTO } from "../dto/request/profile.dto";
import { responseError } from "../../auth/utils/responseError";
import { User } from "../../entity/User";
import { JWT } from "../../auth/security/jwt";
import { RegistryDTO } from "../../auth/dto/response/auth/registry.dto";
import BaseResponseDTO from "../../auth/dto/response/base.dto";
import { CreateProfileDTO } from "../dto/response/createProfile.dto";

export class ProfileController {
  private profileRepository = AppDataSource.getRepository(Profile);
  private userRepository = AppDataSource.getRepository(User);

  async create(request: Request, response: Response, next: NextFunction) {
    try {
      const body: ProfileDTO = request.body;
      const token = request.headers.authorization.split(" ")[1];

      const id = JWT.getJwtPayloadValueByKey(token, "id");

      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        responseError(response, "User does not exist.");
      }

      if (!user.active) {
        responseError(response, "User not activate.", 401);
      }

      const newProfile = Object.assign(new Profile(), {
        ...body,
        user,
      });

      const newProfileRepository = this.profileRepository.create(newProfile);

      await this.profileRepository.save(newProfileRepository);

      const profile: CreateProfileDTO = newProfile;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profile },
      };

      response.status(200);
      return { ...resp };
    } catch (error) {
      if (response.statusCode === 200) response.status(500);
      const resp: RegistryDTO = {
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

  async all(request: Request, response: Response, next: NextFunction) {
    return this.profileRepository.find();
  }

  async on(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);

    const profile = await this.profileRepository.findOne({
      relations: {
        hiredPerson: true,
      },
      where: { id },
    });

    if (!profile) {
      return "Unregistered profile.";
    }
    return profile;
  }

  async update(request: Request, response: Response, next: NextFunction) {
    try {
      const body: ProfileDTO = request.body;
      const { id } = request.body;
      const token = request.headers.authorization.split(" ")[1];
      const userId = JWT.getJwtPayloadValueByKey(token, "id");

      if (!id)
        responseError(
          response,
          "Delete profile requiere profile id valid.",
          404
        );

      const profileToUpdate = await this.profileRepository.findOne({
        relations: {
          user: true,
        },
        where: { id },
      });

      if (profileToUpdate.user.id !== userId)
        responseError(
          response,
          "User is not authorized to update this profile",
          401
        );

      const profileUpdate = { ...profileToUpdate, ...body };
      await this.profileRepository.save(profileUpdate);

      const profile: ProfileDTO = profileUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profile },
      };

      response.status(201);
      return { ...resp };
    } catch (error) {
      if (response.statusCode === 200) response.status(500);
      const resp: RegistryDTO = {
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

  async partialUpdate(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const body: ProfileDTO = request.body;
      const { id } = request.body;
      const token = request.headers.authorization.split(" ")[1];
      const userId = JWT.getJwtPayloadValueByKey(token, "id");

      if (!id)
        responseError(
          response,
          "Delete profile requiere profile id valid.",
          404
        );

      const fieldToUpdate: string = Object.keys(body)[1];

      const profileToUpdate = await this.profileRepository.findOne({
        relations: {
          user: true,
        },
        where: { id },
      });

      if (!profileToUpdate) {
        responseError(response, "User does not exist.");
      }

      if (profileToUpdate.user.id !== userId)
        responseError(
          response,
          "User is not authorized to update this profile",
          401
        );

      const profileUpdate = {
        ...profileToUpdate,
        [fieldToUpdate]: body[fieldToUpdate],
      };
      await this.profileRepository.save(profileUpdate);

      const profile: ProfileDTO = profileUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profile },
      };

      response.status(200);
      return { ...resp };
    } catch (error) {
      if (response.statusCode === 200) response.status(500);
      const resp: RegistryDTO = {
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

  async delete(request: Request, response: Response, next: NextFunction) {
    try {
      const id = parseInt(request.params.id);

      if (!id)
        responseError(
          response,
          "Delete profile requiere profile id valid.",
          404
        );

      let profileToRemove = await this.profileRepository.findOneBy({ id });

      if (!profileToRemove)
        responseError(response, "This profile does not exist.", 400);

      await this.profileRepository.remove(profileToRemove);

      response.status(204);
      return "Profile has been removed successfully.";
    } catch (error) {
      if (response.statusCode === 200) response.status(500);
      const resp: RegistryDTO = {
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
