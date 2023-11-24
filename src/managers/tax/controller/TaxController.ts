import { NextFunction, Request, Response } from "express";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { responseError } from "../../../errors/responseError";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { Tax } from "../../../entity/Tax";
import { TaxDTO } from "../dto/request/tax.dto";
import { CreateTaxDTO } from "../dto/response/createTax.dto";

export class TaxController extends EntityControllerBase<Tax> {
  constructor() {
    const repository = AppDataSource.getRepository(Tax);
    super(repository);
  }

  async createTax(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: TaxDTO = req.body;

      const objectTax = Object.assign(new Tax(), {
        ...fields,
      });

      const newTax = await this.create(objectTax);

      const tax: CreateTaxDTO = newTax;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { tax },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onTax(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, req, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateTax(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: Tax = req.body;
      const { id } = fields;

      if (!id) responseError(res, "Delete tax requiere id valid.", 404);

      const taxUpdate = await this.update({ id, res }, fields);

      const tax: CreateTaxDTO = taxUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { tax },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async partialUpdateTax(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: TaxDTO = req.body;
      const { id } = req.body;

      if (!id) responseError(res, "Delete tax requiere id valid.", 404);

      const fieldToUpdate: string = Object.keys(fields)[1];
      const taxToUpdate = await this.one({ id, req, res });

      const taxUpdateObject = Object.assign(new Tax(), {
        ...taxToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      });

      const taxUpdate = await this.update({ id, res }, taxUpdateObject);

      const tax: CreateTaxDTO = taxUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { tax },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteTax(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id) responseError(res, "Delete tax requiere id valid.", 404);

      await this.delete({ id, res });

      res.status(204);
      return "Tax has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
