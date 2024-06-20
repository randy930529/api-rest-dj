import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../../../data-source";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { ProfileActivity } from "../../../entity/ProfileActivity";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { ProfileActivityDTO } from "../dto/request/createProfileActivity.dto";
import { responseError } from "../../../errors/responseError";
import getProfileById from "../../../profile/utils/getProfileById";
import { Activity } from "../../../entity/Activity";

export class ProfileActivityController extends EntityControllerBase<ProfileActivity> {
  constructor() {
    const repository = AppDataSource.getRepository(ProfileActivity);
    super(repository);
  }

  async createProfileActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: ProfileActivityDTO = req.body;
      const profileId = fields.profile.id;
      const activityId = fields.activity.id;

      if (!activityId)
        responseError(res, "Do must provide a valid activity id.", 404);

      const profile = await getProfileById({ id: profileId, res });

      const activity = await Activity.findOneBy({
        id: activityId,
      });

      if (!activity) responseError(res, "Activity not found.", 404);

      const objectProfileActivity = Object.assign(new ProfileActivity(), {
        ...fields,
        profile,
        activity,
      });

      const newProfileActivity = await this.create(objectProfileActivity);

      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profileActivity: newProfileActivity },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onProfileActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, req, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateProfileActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: ProfileActivity = req.body;
      const { id } = fields;

      if (!id)
        responseError(res, "Update profile activity requiere id valid.", 404);

      const profileActivityUpdate = await this.update({ id, res }, fields);

      const profileActivity: ProfileActivityDTO = profileActivityUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { activity: profileActivity },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteProfileActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id)
        responseError(res, "Delete profile activity requiere id valid.", 404);

      await this.delete({ id, res });

      res.status(204);
      return "Profile activity has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
