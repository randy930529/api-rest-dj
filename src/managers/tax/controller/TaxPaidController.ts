import { NextFunction, Request, Response } from "express";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { Tax } from "../../../entity/Tax";
import { TaxPaid } from "../../../entity/TaxPaid";
import { responseError } from "../../../errors/responseError";
import getProfileById from "../../../profile/utils/getProfileById";
import { TaxPaidDTO } from "../dto/request/taxPaid.dto";
import { CreateTaxPaidDTO } from "../dto/response/createTaxPaid.dto";

export class TaxPaidController extends EntityControllerBase<TaxPaid> {
  constructor() {
    const repository = AppDataSource.getRepository(TaxPaid);
    super(repository);
  }

  async createTaxPaid(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: TaxPaidDTO = req.body;
      const profileId = fields.profile.id;
      const taxId = fields.tax.id;

      const profile = await getProfileById({ id: profileId, res });

      if (!taxId) responseError(res, "Do must provide a valid tax id.", 404);

      const taxRepository = AppDataSource.getRepository(Tax);

      const tax = await taxRepository.findOneBy({
        id: taxId,
      });

      if (!tax) responseError(res, "Tax not found.", 404);

      const objectTaxPaid = Object.assign(new TaxPaid(), {
        ...fields,
        profile,
        tax,
      });

      const newTaxPaid = await this.create(objectTaxPaid);

      const taxPaid: CreateTaxPaidDTO = newTaxPaid;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { taxPaid },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onTaxPaid(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateTaxPaid(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: TaxPaid = req.body;
      const { id } = fields;

      if (!id) responseError(res, "Delete tax paid requiere id valid.", 404);

      const taxPaidUpdate = await this.update({ id, res }, fields);

      const taxPaid: CreateTaxPaidDTO = taxPaidUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { taxPaid },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async partialUpdateTaxPaid(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: TaxPaidDTO = req.body;
      const { id } = req.body;

      if (!id) responseError(res, "Delete tax paid requiere id valid.", 404);

      const fieldToUpdate: string = Object.keys(fields)[1];
      const taxPaidToUpdate = await this.one({ id, res });

      const taxPaidUpdateObject = Object.assign(new TaxPaid(), {
        ...taxPaidToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      });

      const taxPaidUpdate = await this.update({ id, res }, taxPaidUpdateObject);

      const taxPaid: CreateTaxPaidDTO = taxPaidUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { taxPaid },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteTaxPaid(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id) responseError(res, "Delete tax paid requiere id valid.", 404);

      await this.delete({ id, res });

      res.status(204);
      return "Tax paid has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
