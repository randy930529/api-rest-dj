import { AppDataSource } from "../../data-source";
import { EntityControllerBase } from "../../base/EntityControllerBase";
import { SectionState } from "../../entity/SectionState";
import { NextFunction, Request, Response } from "express";
import { JWT } from "../../auth/security/jwt";
import { SectionStateDTO } from "../../section/dto/request/sectionState.dto";
import { responseError } from "../../errors/responseError";
import { Profile } from "../../entity/Profile";
import { FiscalYear } from "../../entity/FiscalYear";
import { User } from "../../entity/User";
import { createFindOptions } from "../../base/utils/createFindOptions";
import { FindManyOptions } from "typeorm";
import { BaseResponseDTO } from "../../auth/dto/response/base.dto";

export class SectionStateController extends EntityControllerBase<SectionState> {
  constructor() {
    const repository = AppDataSource.getRepository(SectionState);
    super(repository);
  }

  async createSection(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: SectionStateDTO = req.body;
      const { profile, fiscalYear } = fields;

      const token = req.headers.authorization.split(" ")[1];
      const userId = JWT.getJwtPayloadValueByKey(token, "id");

      const existToSectionUser = await this.repository.findOne({
        where: {
          user: {
            id: userId,
          },
        },
      });

      if (existToSectionUser) return existToSectionUser;

      const currentProfile = await Profile.findOne({
        relations: ["user"],
        where: {
          id: profile.id,
          primary: true,
          user: {
            id: userId,
          },
        },
      });

      if (!currentProfile) {
        responseError(res, "Profile does not exist in this user.", 404);
      }

      const currentFiscalYear = await FiscalYear.findOne({
        where: {
          id: fiscalYear.id,
          profile: {
            id: profile.id,
          },
        },
      });

      if (!currentFiscalYear) {
        responseError(res, "Fiscal year does not exist in this profile.", 404);
      }

      const newSectionStateToProfileAndFiscalYear =
        await this.repository.create({
          user: currentProfile.user,
          profile: currentProfile,
          fiscalYear: currentFiscalYear,
        });

      const newSectionState = await this.repository.save(
        newSectionStateToProfileAndFiscalYear
      );

      return newSectionState;
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async allSections(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const userId = JWT.getJwtPayloadValueByKey(token, "id");

      const user = await User.findOneBy({ id: userId });

      if (user.role === "admin") this.all(req, res, next);

      const options: FindManyOptions<SectionState> = createFindOptions(req, {
        where: {
          user: {
            id: userId,
          },
        },
      });
      const sections = await this.repository.find(options);

      res.json(sections);
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async userSection(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const userId = JWT.getJwtPayloadValueByKey(token, "id");

      const existToSectionUser = await this.repository.findOne({
        relations: ["profile", "fiscalYear"],
        where: {
          user: {
            id: userId,
          },
        },
      });

      if (existToSectionUser) return existToSectionUser;

      const currentProfile = await Profile.findOne({
        relations: ["user", "fiscalYear"],
        where: {
          primary: true,
          user: {
            id: userId,
          },
        },
      });

      const newSectionStateToProfileAndFiscalYear =
        await this.repository.create({
          user: currentProfile.user,
          profile: currentProfile,
          fiscalYear: currentProfile.fiscalYear[0] || null,
        });

      const newSectionState = await this.repository.save(
        newSectionStateToProfileAndFiscalYear
      );

      return newSectionState;
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateSectionState(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: SectionStateDTO = req.body;
      const { id } = req.body;
      const token = req.headers.authorization.split(" ")[1];
      const userId = JWT.getJwtPayloadValueByKey(token, "id");

      if (!id)
        responseError(res, "Update section state requiere id valid.", 404);

      const sectionStateToUpdate = await this.repository.findOne({
        relations: ["user", "profile", "fiscalYear"],
        where: { id },
      });

      if (sectionStateToUpdate.user.id !== userId)
        responseError(
          res,
          "User is not authorized to update this section.",
          401
        );

      const profile = await Profile.findOne({
        relations: ["fiscalYear"],
        where: {
          id: fields.profile.id,
          user: {
            id: userId,
          },
        },
      });

      if (!profile)
        responseError(res, "Profile does not exist in this user.", 404);

      const sectionStateUpdate = await this.repository.save({
        ...sectionStateToUpdate,
        profile,
        fiscalYear: fields.fiscalYear || profile.fiscalYear[0] || null,
      });

      const sectionState: SectionStateDTO = sectionStateUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { sectionState },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
  async partialUpdateSectionState(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const fields: SectionStateDTO = req.body;
      const { id } = req.body;
      const token = req.headers.authorization.split(" ")[1];
      const userId = JWT.getJwtPayloadValueByKey(token, "id");

      if (!id)
        responseError(
          res,
          "Update section state requiere section id valid.",
          401
        );

      const fieldToUpdate: string = Object.keys(fields)[1];

      const sectionStateToUpdate = await this.repository.findOne({
        relations: ["user", "profile", "fiscalYear"],
        where: { id },
      });

      if (!sectionStateToUpdate) {
        responseError(res, "User does not exist is this section.", 404);
      }

      if (sectionStateToUpdate.user.id !== userId)
        responseError(
          res,
          "User is not authorized to update this section state.",
          401
        );

      const sectionStateUpdate = await this.repository.save({
        ...sectionStateToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      });

      const sectionState: SectionStateDTO = sectionStateUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { sectionState },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
