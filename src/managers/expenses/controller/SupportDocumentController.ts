import { NextFunction, Request, Response } from "express";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { SupportDocument } from "../../../entity/SupportDocument";
import { SupportDocumentDTO } from "../dto/request/supportDocument.dto";
import { responseError } from "../../../errors/responseError";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { Element } from "../../../entity/Element";
import { FiscalYear } from "../../../entity/FiscalYear";
import { ProfileActivity } from "../../../entity/ProfileActivity";

export class SupportDocumentController extends EntityControllerBase<SupportDocument> {
  constructor() {
    const repository = AppDataSource.getRepository(SupportDocument);
    super(repository);
  }

  async createSupportDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: SupportDocumentDTO = req.body;
      const elementId = fields.element.id;
      const fiscalYearId = fields.fiscalYear.id;

      if (!elementId)
        responseError(res, "Do must provide a valid expense element id.", 404);

      if (!fiscalYearId)
        responseError(res, "Do must provide a valid fiscal yearId id.", 404);

      const elementRepository = AppDataSource.getRepository(Element);
      const fiscalYearRepository = AppDataSource.getRepository(FiscalYear);

      const element = await elementRepository.findOneBy({
        id: elementId,
      });

      if (!element) responseError(res, "Expense element not found.", 404);

      const fiscalYear = await fiscalYearRepository.findOneBy({
        id: fiscalYearId,
      });

      if (!fiscalYear) responseError(res, "Fiscal year not found.", 404);

      let profileActivity: ProfileActivity = null;
      if (fields.profileActivity) {
        const profileActivityId = fields.profileActivity.id;
        if (!profileActivityId)
          responseError(
            res,
            "Do must provide a valid expense profile activity id.",
            404
          );

        profileActivity = await ProfileActivity.findOneBy({
          id: profileActivityId,
        });
        if (!profileActivity)
          responseError(res, "Profile activity not found.", 404);
      }

      const objectSupportDocument = Object.assign(new SupportDocument(), {
        ...fields,
        element,
        fiscalYear,
        profileActivity,
      });

      const newSupportDocument = await this.create(objectSupportDocument);

      const supportDocument: SupportDocumentDTO = newSupportDocument;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { supportDocument },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onSupportDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, req, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateSupportDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: SupportDocument = req.body;
      const { id } = req.body;

      if (!id)
        responseError(res, "Update requiere support document id valid.", 404);

      const supportDocumentUpdate = await this.update({ id, res }, fields);

      const supportDocument: SupportDocumentDTO = supportDocumentUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { supportDocument },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async partialUpdateSupportDocument(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const fields: SupportDocumentDTO = req.body;
      const { id } = req.body;

      if (!id)
        responseError(res, "Update requiere support document id valid.", 404);

      const fieldToUpdate: string = Object.keys(fields)[1];
      const supportDocumentToUpdate = await this.one({ id, req, res });

      const supportDocumentUpdate = Object.assign(new SupportDocument(), {
        ...supportDocumentToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      });

      await this.update({ id, res }, supportDocumentUpdate);

      const supportDocument: SupportDocumentDTO = supportDocumentUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { supportDocument },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteSupportDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id)
        responseError(
          res,
          "Delete support document requiere one id valid.",
          404
        );

      await this.delete({ id, res });

      res.status(204);
      return "Support document has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
