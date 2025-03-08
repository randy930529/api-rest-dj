import { FindManyOptions, FindOptionsWhere } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { responseError } from "../../errors/responseError";
import { AppDataSource } from "../../data-source";
import { EntityControllerBase } from "../../base/EntityControllerBase";
import { BaseResponseDTO } from "../../auth/dto/response/base.dto";
import { createFindOptions } from "../../base/utils/createFindOptions";
import { SectionState } from "../../entity/SectionState";
import { JWT } from "../../auth/security/jwt";
import { SectionStateDTO } from "../../section/dto/request/sectionState.dto";
import { Profile } from "../../entity/Profile";
import { FiscalYear } from "../../entity/FiscalYear";
import { User } from "../../entity/User";
import { LicenseUser } from "../../entity/LicenseUser";
import {
  SECTION_SELECT,
  SECTION_RELATIONS,
  getExistToSectionUser,
} from "../utils/query/sectionsUser.fetch";
import {
  PROFILE_SELECT,
  PROFILE_RELATIONS,
} from "../utils/query/sectionsProfile.fetch";
import {
  LISENCE_USER_ORDER,
  LISENCE_USER_RELATIONS,
  LISENCE_USER_SELECT,
} from "../utils/query/sectionsLicenseUser.fetch";

export class SectionStateController extends EntityControllerBase<SectionState> {
  constructor() {
    const repository = AppDataSource.getRepository(SectionState);
    super(repository);
  }

  async createSection(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: SectionStateDTO = req.body;
      const { profile, fiscalYear, licenseUser } = fields;
      const { token } = req.body;

      const userId = JWT.getJwtPayloadValueByKey(token, "id");

      const SECTION_WHERE = {
        user: {
          id: userId,
        },
      };
      const existToSectionUser = await this.repository.findOne({
        select: SECTION_SELECT,
        relations: SECTION_RELATIONS,
        where: SECTION_WHERE,
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

      const currentLicenseUser = await LicenseUser.findOne({
        where: {
          id: licenseUser.id,
          user: {
            id: licenseUser.user.id,
          },
        },
      });

      if (!currentLicenseUser) {
        responseError(res, "LicenseUser does not exist in this user.", 404);
      }

      const newSectionStateToProfileAndFiscalYear =
        await this.repository.create({
          user: currentProfile.user,
          licenseUser: currentLicenseUser,
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
      const { user }: { user: User } = req.body;
      const { id, role } = user;

      if (role === "admin") this.all(req, res, next);

      const options: FindManyOptions<SectionState> = createFindOptions(req, {
        where: {
          user: {
            id,
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
      const { token } = req.body;
      const id = JWT.getJwtPayloadValueByKey(token, "id");

      const existToSectionUser = await getExistToSectionUser(
        id,
        this.repository
      );

      if (existToSectionUser) return existToSectionUser;

      const PROFILE_WHERE = {
        primary: true,
        user: {
          id,
        },
      };
      const currentProfile = await Profile.findOne({
        select: PROFILE_SELECT,
        relations: PROFILE_RELATIONS,
        where: PROFILE_WHERE,
      });

      const LISENCE_USER_WHERE = {
        is_paid: true,
        user: {
          id,
        },
      };
      const currentLicenseUser = await LicenseUser.find({
        select: LISENCE_USER_SELECT,
        relations: LISENCE_USER_RELATIONS,
        where: LISENCE_USER_WHERE,
        order: LISENCE_USER_ORDER,
      });

      const newSectionStateToProfileAndFiscalYear =
        await this.repository.create({
          user: currentProfile.user,
          licenseUser: currentLicenseUser[0] || null,
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
      const { id, token } = req.body;
      const userId = JWT.getJwtPayloadValueByKey(token, "id");
      const profileId = fields.profile?.id;
      const fiscalYearId = fields.fiscalYear?.id;

      if (!id)
        responseError(res, "Update section state requiere id valid.", 404);

      const sectionStateToUpdate = await this.repository.findOne({
        relations: ["user"],
        where: { id },
      });

      if (!sectionStateToUpdate) responseError(res, "Section not found.", 404);

      if (sectionStateToUpdate.user.id !== userId)
        responseError(
          res,
          "User is not authorized to update this section.",
          401
        );

      const PROFILE_WHERE = {
        id: profileId,
        user: {
          id: userId,
        },
      };
      const profile = await Profile.findOne({
        select: PROFILE_SELECT,
        relations: PROFILE_RELATIONS,
        where: PROFILE_WHERE,
      });

      if (!profile)
        responseError(res, "Profile does not exist in this user.", 404);

      const fiscalYear: FiscalYear =
        profile.fiscalYear.find((val) => val.id === fiscalYearId) ||
        profile.fiscalYear.find(
          (val) => val.id === profile.currentfiscalYear
        ) ||
        profile.fiscalYear[0] ||
        null;

      if (profile && fiscalYear) {
        profile.currentfiscalYear = fiscalYear.id;
        await profile.save();
      }
      await this.repository.save({
        ...sectionStateToUpdate,
        profile,
        fiscalYear,
      });

      const existToSectionUser = await this.repository.findOne({
        select: SECTION_SELECT,
        relations: SECTION_RELATIONS,
        where: { id },
      });

      const sectionState: SectionStateDTO = existToSectionUser;
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
      const { id, token } = req.body;
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

      if (!sectionStateToUpdate) responseError(res, "Section not found.", 404);

      if (sectionStateToUpdate.user.id !== userId)
        responseError(
          res,
          "User is not authorized to update this section state.",
          401
        );

      let toUpdate = {
        ...sectionStateToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      };

      if (fieldToUpdate === "profile") {
        const profile = await Profile.findOne({
          relations: ["fiscalYear"],
          where: {
            id: fields[fieldToUpdate].id,
            user: {
              id: userId,
            },
          },
        });

        if (!profile)
          responseError(res, "Profile does not exist in this user.", 404);

        toUpdate.profile = profile;
        toUpdate.fiscalYear = profile.fiscalYear[0] || null;
      } else if (fieldToUpdate === "fiscalYear") {
        const fiscalYear = await FiscalYear.findOne({
          where: {
            id: fields[fieldToUpdate].id,
            profile: {
              user: {
                id: userId,
              },
            },
          },
        });

        if (!fiscalYear)
          responseError(
            res,
            "Fiscal year does not exist in this profile.",
            404
          );

        toUpdate.fiscalYear = fiscalYear;
      }

      const sectionStateUpdate = await this.repository.save(toUpdate);

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
