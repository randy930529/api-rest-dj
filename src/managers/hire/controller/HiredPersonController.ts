import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { HiredPerson } from "../../../entity/HiredPerson";
import { NextFunction, Request, Response } from "express";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { HiredPersonDTO } from "../dto/request/hiredPerson.dto";
import { CreateHiredPersonDTO } from "../dto/response/createHiredPerson.dto";
import { responseError } from "../../../errors/responseError";
import getProfileById from "../../../profile/utils/getProfileById";
import { Address } from "../../../entity/Address";

export class HiredPersonController extends EntityControllerBase<HiredPerson> {
  constructor() {
    const repository = AppDataSource.getRepository(HiredPerson);
    super(repository);
  }

  async createHiredPerson(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: HiredPersonDTO = req.body;
      const { id } = fields.profile;

      const profile = await getProfileById({ id, res });

      const addressDTO = await Address.create(fields.address);
      const address = await addressDTO.save();

      const objectHiredPerson = Object.assign(new HiredPerson(), {
        ...fields,
        profile,
        address,
      });

      const newHiredPerson = await this.create(objectHiredPerson);

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
      next(error);
    }
  }

  async onHiredPerson(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, req, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateHiredPerson(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: HiredPerson = req.body;
      const { id } = fields.profile;

      if (!id)
        responseError(
          res,
          "Update pired person requiere profile id valid.",
          404
        );

      const hiredPersonUpdate = await this.update({ id, res: res }, fields);

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
      next(error);
    }
  }

  async partialUpdateHiredPerson(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const fields: HiredPersonDTO = req.body;
      const { id } = req.body;

      if (!id)
        responseError(res, "Update requiere hired person id valid.", 404);

      const fieldToUpdate: string = Object.keys(fields)[1];
      const hiredPersonToUpdate = await this.one({ id, req, res });

      const hiredPersonUpdate = Object.assign(new HiredPerson(), {
        ...hiredPersonToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
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
      next(error);
    }
  }

  async deleteHiredPerson(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id)
        responseError(
          res,
          "Delete hired person requiere profile id valid.",
          404
        );

      await this.delete({ id, res });

      res.status(204);
      return "Hired person has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
