import { NextFunction, Request, Response } from "express";
import * as moment from "moment";
import { AppDataSource } from "../../../data-source";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { ProfileActivity } from "../../../entity/ProfileActivity";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { ProfileActivityDTO } from "../dto/request/createProfileActivity.dto";
import { responseError } from "../../../errors/responseError";
import getProfileById from "../../../profile/utils/getProfileById";
import { Activity } from "../../../entity/Activity";
import { Dj08SectionData, SectionName } from "../../../entity/Dj08SectionData";
import {
  AllDataSectionsDj08Type,
  DataSectionAType,
  TotalSectionAType,
} from "../../../utils/definitions";
import { calculeF20ToDj08 } from "../../../reports/utils/utilsToReports";
import { FiscalYear } from "../../../entity/FiscalYear";

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
      const fiscalYearId = fields.fiscalYear.id;

      if (!activityId)
        responseError(res, "Do must provide a valid activity id.", 404);

      const profile = await getProfileById({ id: profileId, res });
      const fiscalYear = await FiscalYear.findOneBy({ id: fiscalYearId });

      const activity = await Activity.findOneBy({
        id: activityId,
      });

      if (!activity) responseError(res, "Activity not found.", 404);

      const objectProfileActivity = Object.assign(new ProfileActivity(), {
        ...fields,
        profile,
        activity,
        fiscalYear,
      });

      const newProfileActivity = await this.create(objectProfileActivity);
      await this.updatedDJ08(newProfileActivity);

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
      await this.updatedDJ08(profileActivityUpdate);

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

      const removeProfileActivity = await this.delete({ id, res });
      await this.updatedDJ08(removeProfileActivity);

      res.status(204);
      return "Profile activity has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  /**
   * @AfterInsert
   * @AfterUpdate
   * @AfterRemove
   */
  private async updatedDJ08(profileActivity: ProfileActivity): Promise<void> {
    const profileId = profileActivity.__profileId__;
    const fiscalYearId = profileActivity.__fiscalYearId__;

    const dj08ToUpdate = await Dj08SectionData.findOne({
      where: {
        dJ08: {
          profile: { id: profileId },
          fiscalYear: { id: fiscalYearId },
        },
        is_rectification: true,
      },
    });

    const fiscalYearToUpdate = await FiscalYear.findOne({
      select: {
        profileActivities: {
          id: true,
          primary: true,
          date_start: true,
          date_end: true,
          supportDocuments: {
            id: true,
            type_document: true,
            amount: true,
            element: { id: true, group: true },
          },
          activity: {
            id: true,
            code: true,
            description: true,
            to_tcp: true,
          },
        },
      },
      relations: {
        profileActivities: {
          activity: true,
          supportDocuments: { element: true },
        },
      },
      where: {
        id: fiscalYearId,
        profile: { id: profileId },
      },
    });
    const profileActivities = fiscalYearToUpdate?.profileActivities || [];

    const { section_data: sectionDataJSONString } = dj08ToUpdate;
    const section_data: AllDataSectionsDj08Type = JSON.parse(
      sectionDataJSONString
    );

    const newDataSectionA: { [key: string | number]: DataSectionAType } = {};
    const newTotalSectionA: TotalSectionAType = { incomes: 0, expenses: 0 };

    for (let i = 0; i < profileActivities.length; i++) {
      const activity = profileActivities[i];
      const { date_start, date_end, primary, supportDocuments = [] } = activity;
      const { code, description, to_tcp } = activity.activity;
      const date_start_day = moment(date_start).date();
      const date_start_month = moment(date_start).month() + 1;
      const date_end_day = moment(date_end).date();
      const date_end_month = moment(date_end).month() + 1;

      if (primary && fiscalYearToUpdate?.is_tcp !== to_tcp) {
        fiscalYearToUpdate.is_tcp = to_tcp;
      }

      const { income, expense } = supportDocuments.reduce(
        (sumaTotal, document) => {
          if (
            document.type_document === "i" &&
            document.element.group?.trim() === "iggv"
          ) {
            sumaTotal.income = parseFloat(
              (sumaTotal.income + document.amount).toFixed()
            );
          } else if (
            document.type_document === "g" &&
            document.element.group?.trim() === "pdgt"
          ) {
            sumaTotal.expense = parseFloat(
              (sumaTotal.expense + document.amount).toFixed()
            );
          }

          return sumaTotal;
        },
        { income: 0, expense: 0 }
      );

      const data: DataSectionAType = {
        activity: `${code} - ${description}`,
        period: {
          start: [date_start_day, date_start_month],
          end: [date_end_day, date_end_month],
        },
        income,
        expense,
      };
      newDataSectionA[`F${i + 1}`] = data;
      newTotalSectionA.incomes += income;
      newTotalSectionA.expenses += expense;
    }
    section_data[SectionName.SECTION_A].data = newDataSectionA;
    section_data[SectionName.SECTION_A].totals = newTotalSectionA;
    section_data[SectionName.SECTION_B].data["F11"] = newTotalSectionA.incomes;
    section_data[SectionName.SECTION_B].data["F13"] = newTotalSectionA.expenses;

    const dataSectionB = section_data[SectionName.SECTION_B].data as {
      [key: string]: number;
    };
    section_data[SectionName.SECTION_B].data["F20"] =
      calculeF20ToDj08(dataSectionB);

    dj08ToUpdate.section_data = JSON.stringify(section_data);
    await dj08ToUpdate.save();
    await fiscalYearToUpdate?.save();
  }
}
