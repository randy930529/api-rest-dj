import { Request } from "express-validator/src/base";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { HiredPerson } from "../../../entity/HiredPerson";
import { NextFunction, Response } from "express";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { HiredPersonDTO } from "../dto/request/hiredPerson.dto";
import { CreateHiredPersonDTO } from "../dto/response/createHiredPerson.dto";
import { Profile } from "../../../entity/Profile";
import { responseError } from "../../../errors/responseError";

export class HiredPersonController extends EntityControllerBase<HiredPerson> {
  constructor() {
    const repository = AppDataSource.getRepository(HiredPerson);
    super(repository);
  }

  async createHiredPerson(req: Request, res: Response, next: NextFunction) {
    try {
      const body: HiredPersonDTO = req.body;
      const { id } = body.profile;

      if (!id) responseError(res, "Do must provide a valid profile id.", 404);

      const profileRepository = AppDataSource.getRepository(Profile);

      const profile = await profileRepository.findOne({
        where: { id },
      });

      if (!profile) responseError(res, "Profile not found.", 404);

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

  async onHiredPerson(req: Request, res: Response, next: NextFunction) {
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

  async updateHiredPerson(req: Request, res: Response, next: NextFunction) {
    try {
      const body: HiredPerson = req.body;
      const { id } = body.profile;

      if (!id)
        responseError(
          res,
          "Update pired person requiere profile id valid.",
          404,
        );

      const hiredPersonUpdate = await this.update({ id, res: res }, body);

      const hiredPerson: CreateHiredPersonDTO = hiredPersonUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { hiredPerson },
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

  async partialUpdateHiredPerson(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const body: HiredPersonDTO = req.body;
      const { id } = req.body;

      if (!id)
        responseError(res, "Update requiere hired person id valid.", 404);

      const fieldToUpdate: string = Object.keys(body)[1];
      const hiredPersonToUpdate = await this.one({ id, res });

      const hiredPersonUpdate = Object.assign(new HiredPerson(), {
        ...hiredPersonToUpdate,
        [fieldToUpdate]: body[fieldToUpdate],
      });

      await this.update({ id, res }, hiredPersonUpdate);

      const hiredPerson: CreateHiredPersonDTO = hiredPersonUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { hiredPerson },
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

  async deleteHiredPerson(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id)
        responseError(
          res,
          "Delete hired person requiere profile id valid.",
          404,
        );

      await this.delete({ id, res });

      res.status(204);
      return "Hired person has been removed successfully.";
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
