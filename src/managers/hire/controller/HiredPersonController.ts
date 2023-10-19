import { Request } from "express-validator/src/base";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { HiredPerson } from "../../../entity/HiredPerson";
import { NextFunction, Response } from "express";
import BaseResponseDTO from "../../../auth/dto/response/base.dto";
import { HiredPersonDTO } from "../dto/request/hired.person.dto";
import { CreateHiredPersonDTO } from "../dto/response/createHiredPerson.dto";
import { Profile } from "../../../entity/Profile";
import { responseError } from "../../../auth/utils/responseError";

export class HiredPersonController extends EntityControllerBase<HiredPerson> {
  constructor() {
    const repository = AppDataSource.getRepository(HiredPerson);
    super(repository);
  }

  async createHiredPerson(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const body: HiredPersonDTO = request.body;
      const { id } = body.profile;

      if (!id)
        responseError(response, "Do must provide a valid profile id.", 404);

      const profileRepository = AppDataSource.getRepository(Profile);

      const profile = await profileRepository.findOne({
        where: { id },
      });

      if (!profile) responseError(response, "Profile not found.", 404);

      const newHiredPerson = Object.assign(new HiredPerson(), {
        ...body,
        profile,
      });

      await this.create(newHiredPerson);

      const hiredPerson: CreateHiredPersonDTO = newHiredPerson;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { hiredPerson },
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

  async onHiredPerson(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
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

  async updateHiredPerson(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const body: HiredPerson = request.body;
      const { id } = body.profile;

      if (!id)
        responseError(
          response,
          "Delete pired person requiere profile id valid.",
          404
        );

      const profileUpdate = await this.update({ id, res: response }, body);

      const hiredPerson: CreateHiredPersonDTO = profileUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { hiredPerson },
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

  async partialUpdateHiredPerson(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const body: HiredPersonDTO = request.body;
      const { id } = request.body;

      if (!id)
        responseError(
          response,
          "Delete profile requiere profile id valid.",
          404
        );

      const fieldToUpdate: string = Object.keys(body)[1];
      const hiredPersonToUpdate = await this.one({ id, res: response });

      const hiredPersonUpdate = Object.assign(new HiredPerson(), {
        ...hiredPersonToUpdate,
        [fieldToUpdate]: body[fieldToUpdate],
      });

      await this.update({ id, res: response }, hiredPersonUpdate);

      const profile: CreateHiredPersonDTO = hiredPersonUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profile },
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

  async deleteHiredPerson(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const id = parseInt(request.params.id);

      if (!id)
        responseError(
          response,
          "Delete hired person requiere profile id valid.",
          404
        );

      let profileToRemove = await this.delete({ id, res: response });

      response.status(204);
      return "Hired person has been removed successfully.";
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
