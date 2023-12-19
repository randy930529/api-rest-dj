import { NextFunction, Request, Response } from "express";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { Element } from "../../../entity/Element";
import { responseError } from "../../../errors/responseError";
import getProfileById from "../../../profile/utils/getProfileById";
import { ElementDTO } from "../dto/request/element.dto";
import { CreateExpenseElementDTO } from "../dto/response/createExpenseElement.dto";

export class ElementController extends EntityControllerBase<Element> {
  constructor() {
    const repository = AppDataSource.getRepository(Element);
    super(repository);
  }

  async createExpenseElement(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: ElementDTO = req.body;
      const { id } = fields.profile;

      const profile = await getProfileById({ id, res });

      const objectExpenseElement = Object.assign(new Element(), {
        ...fields,
        profile,
      });

      const newExpenseElement = await this.create(objectExpenseElement);

      const expenseElement: CreateExpenseElementDTO = newExpenseElement;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { expenseElement },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onExpenseElement(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, req, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateExpenseElement(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: Element = req.body;
      const { id } = fields;

      if (!id)
        responseError(res, "Delete expense element requiere id valid.", 404);

      const expenseElementUpdate = await this.update({ id, res }, fields);

      const expenseElement: CreateExpenseElementDTO = expenseElementUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { expenseElement },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async partialUpdateExpenseElement(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const fields: ElementDTO = req.body;
      const { id } = req.body;

      if (!id)
        responseError(res, "Delete expense element requiere id valid.", 404);

      const fieldToUpdate: string = Object.keys(fields)[1];
      const expenseElementToUpdate = await this.one({ id, req, res });

      const expenseElementUpdateObject = Object.assign(new Element(), {
        ...expenseElementToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      });

      const expenseElementUpdate = await this.update(
        { id, res },
        expenseElementUpdateObject
      );

      const expenseElement: CreateExpenseElementDTO = expenseElementUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { expenseElement },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteExpenseElement(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id)
        responseError(res, "Delete expense element requiere id valid.", 404);

      await this.delete({ id, res });

      res.status(204);
      return "Expense element has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
