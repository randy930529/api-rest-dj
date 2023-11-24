import { NextFunction, Request, Response } from "express";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { FiscalYear } from "../../../entity/FiscalYear";
import { responseError } from "../../../errors/responseError";
import getProfileById from "../../../profile/utils/getProfileById";
import { FiscalYearDTO } from "../dto/request/fiscalYear.dto";
import { CreateFiscalYearDTO } from "../dto/response/createFiscalYear.dto";

export class FiscalYearController extends EntityControllerBase<FiscalYear> {
  constructor() {
    const repository = AppDataSource.getRepository(FiscalYear);
    super(repository);
  }

  async createFiscalYear(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: FiscalYearDTO = req.body;
      const { id } = fields.profile;

      const profile = await getProfileById({ id, res });

      const objectFiscalYear = Object.assign(new FiscalYear(), {
        ...fields,
        profile,
      });

      const newFiscalYear = await this.create(objectFiscalYear);

      const fiscalYear: CreateFiscalYearDTO = newFiscalYear;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { fiscalYear },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onFiscalYear(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, req, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateFiscalYear(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: FiscalYear = req.body;
      const { id } = fields;

      if (!id) responseError(res, "Delete fiscal year requiere id valid.", 404);

      const fiscalYearUpdate = await this.update({ id, res }, fields);

      const fiscalYear: CreateFiscalYearDTO = fiscalYearUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { fiscalYear },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async partialUpdateFiscalYear(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const fields: FiscalYearDTO = req.body;
      const { id } = req.body;

      if (!id) responseError(res, "Delete fiscal year requiere id valid.", 404);

      const fieldToUpdate: string = Object.keys(fields)[1];
      const fiscalYearToUpdate = await this.one({ id, req, res });

      const fiscalYearUpdateObject = Object.assign(new FiscalYear(), {
        ...fiscalYearToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      });

      const fiscalYearUpdate = await this.update(
        { id, res },
        fiscalYearUpdateObject
      );

      const fiscalYear: CreateFiscalYearDTO = fiscalYearUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { fiscalYear },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteFiscalYear(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id) responseError(res, "Delete fiscal year requiere id valid.", 404);

      await this.delete({ id, res });

      res.status(204);
      return "Fiscal year has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
