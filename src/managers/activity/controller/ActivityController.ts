import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../../../data-source";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { Activity } from "../../../entity/Activity";
import { ActivityDTO } from "../dto/request/createActivity.dto";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { responseError } from "../../../errors/responseError";

export class ActivityController extends EntityControllerBase<Activity> {
  constructor() {
    const repository = AppDataSource.getRepository(Activity);
    super(repository);
  }

  async createActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: ActivityDTO = req.body;

      const objectActivity = Object.assign(new Activity(), {
        ...fields,
      });

      const newActivity = await this.create(objectActivity);

      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { activity: newActivity },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, req, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: Activity = req.body;
      const { id } = fields;

      if (!id) responseError(res, "Update activity requiere id valid.", 404);

      const activityUpdate = await this.update({ id, res }, fields);

      const activity: ActivityDTO = activityUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { activity },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id) responseError(res, "Delete activity requiere id valid.", 404);

      await this.delete({ id, res });

      res.status(204);
      return "Activity has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
