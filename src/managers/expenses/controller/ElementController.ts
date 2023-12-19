import { NextFunction, Request, Response } from "express";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { Element } from "../../../entity/Element";
import { responseError } from "../../../errors/responseError";
import getProfileById from "../../../profile/utils/getProfileById";
import { ElementDTO } from "../dto/request/element.dto";
import { CreateElementDTO } from "../dto/response/createElement.dto";

export class ElementController extends EntityControllerBase<Element> {
  constructor() {
    const repository = AppDataSource.getRepository(Element);
    super(repository);
  }

  async createElement(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: ElementDTO = req.body;
      const { id } = fields.profile;

      const profile = await getProfileById({ id, res });

      const objectElement = Object.assign(new Element(), {
        ...fields,
        profile,
      });

      const newElement = await this.create(objectElement);

      const element: CreateElementDTO = newElement;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { element },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onElement(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, req, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateElement(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: Element = req.body;
      const { id } = fields;

      if (!id) responseError(res, "Delete element requiere id valid.", 404);

      const elementUpdate = await this.update({ id, res }, fields);

      const element: CreateElementDTO = elementUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { element },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async partialUpdateElement(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: ElementDTO = req.body;
      const { id } = req.body;

      if (!id) responseError(res, "Delete element requiere id valid.", 404);

      const fieldToUpdate: string = Object.keys(fields)[1];
      const elementToUpdate = await this.one({ id, req, res });

      const elementUpdateObject = Object.assign(new Element(), {
        ...elementToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      });

      const elementUpdate = await this.update({ id, res }, elementUpdateObject);

      const element: CreateElementDTO = elementUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { element },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteElement(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id) responseError(res, "Delete element requiere id valid.", 404);

      await this.delete({ id, res });

      res.status(204);
      return " element has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
