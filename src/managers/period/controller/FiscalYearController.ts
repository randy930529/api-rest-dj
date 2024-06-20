import { NextFunction, Request, Response } from "express";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { FiscalYear } from "../../../entity/FiscalYear";
import { responseError } from "../../../errors/responseError";
import getProfileById from "../../../profile/utils/getProfileById";
import { FiscalYearDTO } from "../dto/request/fiscalYear.dto";
import { CreateFiscalYearDTO } from "../dto/response/createFiscalYear.dto";
import { Dj08SectionData } from "../../../entity/Dj08SectionData";
import { defaultSectionDataInit } from "../utils";
import { MusicalGroup } from "../../../entity/MusicalGroup";

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

      fields.musicalGroup =
        !fields.individual && fields.musicalGroup
          ? fields.musicalGroup
          : undefined;

      const objectFiscalYear = Object.assign(new FiscalYear(), {
        ...fields,
        profile,
      });

      const newFiscalYear = await this.create(objectFiscalYear);

      const section_data = defaultSectionDataInit();

      const newDj08Data = await Dj08SectionData.create({
        dJ08: { fiscalYear: newFiscalYear, profile: profile },
        section_data,
      });

      await newDj08Data.save();

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

      if (!id) responseError(res, "Update fiscal year requiere id valid.", 404);

      fields.musicalGroup =
        !fields.individual && fields.musicalGroup
          ? fields.musicalGroup
          : undefined;

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

      if (!id) responseError(res, "Update fiscal year requiere id valid.", 404);

      const fieldToUpdate: string = Object.keys(fields)[1];
      const fiscalYearToUpdate = await this.one({ id, req, res });

      const fiscalYearUpdateObject = this.repository.create({
        ...fiscalYearToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      });

      const fiscalYearUpdate = await this.repository.save(
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

  async deleteMusicalGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.fiscalYearId);

      if (!id)
        responseError(
          res,
          "Delete the musical group, requiere a fiscal year id valid.",
          404
        );

      const fiscalYearToRemoveMusicalGroup = await this.repository.findOne({
        relations: ["musicalGroup"],
        where: { id },
      });

      if (!fiscalYearToRemoveMusicalGroup)
        responseError(res, "Fiscal year not found.", 404);

      if (fiscalYearToRemoveMusicalGroup.musicalGroup) {
        const { musicalGroup } = fiscalYearToRemoveMusicalGroup;
        fiscalYearToRemoveMusicalGroup.musicalGroup = null;

        await this.repository.save(fiscalYearToRemoveMusicalGroup);
        await musicalGroup.remove();
      }

      res.status(204);
      return "Musical group has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
