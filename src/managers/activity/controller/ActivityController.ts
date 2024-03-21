import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../../../data-source";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { Activity } from "../../../entity/Activity";
import { ActivityDTO } from "../dto/request/createActivity.dto";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";

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
}
