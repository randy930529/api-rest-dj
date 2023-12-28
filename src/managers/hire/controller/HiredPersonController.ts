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
      let fields: HiredPersonDTO = req.body;
      const { id } = req.body;

      if (!id)
        responseError(
          res,
          "Update hired person requiere profile id valid.",
          404
        );

      const hiredPersonToUpdate = await this.repository.findOne({
        relations: ["address"],
        where: { id },
      });

      if (!hiredPersonToUpdate) responseError(res, "Entity not found.", 404);

      if (!hiredPersonToUpdate.address) {
        const address = await Address.create(fields.address);
        await address.save();
        fields = { ...fields, address };
      }

      const entityUpdate = { ...hiredPersonToUpdate, ...fields };

      const hiredPersonUpdate = await this.repository.save(entityUpdate);

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
      let fields: HiredPersonDTO = req.body;
      const { id } = req.body;

      if (!id)
        responseError(res, "Update requiere hired person id valid.", 404);

      const fieldToUpdate: string = Object.keys(fields)[1];
      const hiredPersonToUpdate = await this.repository.findOne({
        relations: ["address"],
        where: { id },
      });

      if (!hiredPersonToUpdate) responseError(res, "Entity not found.", 404);

      if (!hiredPersonToUpdate.address && fieldToUpdate === "address") {
        const address = await Address.create(fields.address);
        await address.save();
        fields = { ...fields, address };
      }

      const hiredPersonUpdate = Object.assign(new HiredPerson(), {
        ...hiredPersonToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      });

      const entityToUpdate = await this.repository.save(hiredPersonUpdate);

      const hiredPerson: CreateHiredPersonDTO = entityToUpdate;
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
