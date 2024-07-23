import { NextFunction, Request, Response } from "express";
import { In, Not } from "typeorm";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { ProfileHiredPerson } from "../../../entity/ProfileHiredPerson";
import { ProfileHiredPersonDTO } from "../dto/request/profileHiredPerson.dto";
import { responseError } from "../../../errors/responseError";
import { HiredPerson } from "../../../entity/HiredPerson";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import getProfileById from "../../../profile/utils/getProfileById";
import { ProfileHiredPersonActivity } from "../../../entity/ProfileHiredPersonActivity";
import { Dj08SectionData, SectionName } from "../../../entity/Dj08SectionData";
import { SectionState } from "../../../entity/SectionState";
import {
  AllDataSectionsDj08Type,
  DataSectionIType,
  TotalSectionIType,
} from "../../../utils/definitions";

export class ProfileHiredPersonController extends EntityControllerBase<ProfileHiredPerson> {
  constructor() {
    const repository = AppDataSource.getRepository(ProfileHiredPerson);
    super(repository);
  }

  async createProfileHiredPerson(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const fields: ProfileHiredPersonDTO = req.body;
      const profileId = fields.profile.id;
      const hiredPersonId = fields.hiredPerson.id;

      if (!hiredPersonId)
        responseError(res, "Do must provide a valid hired person id.", 404);

      const profile = await getProfileById({ id: profileId, res });

      const hiredPerson = await HiredPerson.findOneBy({
        id: hiredPersonId,
      });

      if (!hiredPerson) responseError(res, "Hired person not found.", 404);

      const objectProfileHiredPerson = Object.assign(new ProfileHiredPerson(), {
        ...fields,
        profile,
        hiredPerson,
        profileHiredPersonActivity: [],
      });

      const newProfileHiredPerson = await this.create(objectProfileHiredPerson);

      if (fields.profileHiredPersonActivity) {
        await fields.profileHiredPersonActivity.map(async (val) => {
          await ProfileHiredPersonActivity.create({
            ...val,
            profileHiredPerson: newProfileHiredPerson,
          }).save();
        });
      }

      await this.updatedDJ08(newProfileHiredPerson);

      const profileHiredPerson: ProfileHiredPersonDTO = newProfileHiredPerson;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profileHiredPerson },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      console.log(error);
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onProfileHiredPerson(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, req, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateProfileHiredPerson(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const fields: ProfileHiredPerson = req.body;
      const { id } = req.body;

      if (!id)
        responseError(
          res,
          "Update profile hired person requiere profile id valid.",
          404
        );

      if (fields.profileHiredPersonActivity) {
        const profileHiredPersonActivityIds: number[] = [];

        for (let i = 0; i < fields.profileHiredPersonActivity.length; i++) {
          const element = fields.profileHiredPersonActivity[i];
          const profileHiredPersonActivityId = (
            await ProfileHiredPersonActivity.create({
              ...element,
              profileHiredPerson: { id },
            }).save()
          ).id;

          if (profileHiredPersonActivityId) {
            profileHiredPersonActivityIds.push(profileHiredPersonActivityId);
          }
        }

        const profileHiredPersonActivityToRemove =
          await ProfileHiredPersonActivity.find({
            where: {
              id: Not(In(profileHiredPersonActivityIds)),
              profileHiredPerson: { id },
            },
          });
        profileHiredPersonActivityToRemove.forEach(async (val) => val.remove());
        fields.profileHiredPersonActivity = undefined;
      }

      const profileHiredPersonUpdate = await this.update({ id, res }, fields);

      await this.updatedDJ08(profileHiredPersonUpdate);

      const profileHiredPerson: ProfileHiredPersonDTO =
        profileHiredPersonUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profileHiredPerson },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      console.log(error);
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async partialUpdateProfileHiredPerson(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const fields: ProfileHiredPersonDTO = req.body;
      const { id } = req.body;

      if (!id)
        responseError(
          res,
          "Update requiere profile hired person id valid.",
          404
        );

      const fieldToUpdate: string = Object.keys(fields)[1];
      const profileHiredPersonToUpdate = await this.one({ id, req, res });

      const profileHiredPersonUpdate = Object.assign(new ProfileHiredPerson(), {
        ...profileHiredPersonToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      });

      await this.update({ id, res }, profileHiredPersonUpdate);

      const profileHiredPerson: ProfileHiredPersonDTO =
        profileHiredPersonUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profileHiredPerson },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteProfileHiredPerson(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = parseInt(req.params.id);

      if (!id)
        responseError(
          res,
          "Delete profile hired person requiere profile id valid.",
          404
        );

      const profileHiredPersonToRemove = await this.delete({ id, res });

      await this.updatedDJ08(profileHiredPersonToRemove);

      res.status(204);
      return "Profile hired person has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteProfileHiredPersonActivity(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = parseInt(req.params.id);

      if (!id)
        responseError(
          res,
          "Delete profile hired person activity requiere id valid.",
          404
        );

      const profileHiredPersonActivityToRemove =
        await ProfileHiredPersonActivity.findOne({
          select: ["profileHiredPerson"],
          relations: {
            profileHiredPerson: true,
          },
          where: { id },
        });

      if (!profileHiredPersonActivityToRemove)
        responseError(res, "ProfileHiredPersonActivity not found.", 404);

      await ProfileHiredPersonActivity.remove(
        profileHiredPersonActivityToRemove
      );

      profileHiredPersonActivityToRemove.profileHiredPerson.import -=
        profileHiredPersonActivityToRemove.annual_cost;
      await this.repository.save(
        profileHiredPersonActivityToRemove.profileHiredPerson
      );

      res.status(204);
      return "Profile hired person activity has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  private async updatedDJ08(
    profileHiredPerson: ProfileHiredPerson
  ): Promise<void> {
    const section = await SectionState.findOne({
      select: { fiscalYear: { id: true } },
      relations: ["fiscalYear"],
      where: { profile: { id: profileHiredPerson.profile.id } },
    });
    const { id: fiscalYearId } = section.fiscalYear;

    const dj08ToUpdate = await Dj08SectionData.findOne({
      where: {
        dJ08: {
          profile: { id: profileHiredPerson.profile.id },
          fiscalYear: { id: fiscalYearId },
        },
        is_rectification: true,
      },
    });

    const profileHiredPersonActivity = await ProfileHiredPersonActivity.find({
      select: {
        profileHiredPerson: {
          id: true,
          date_start: true,
          date_end: true,
          import: true,
          hiredPerson: {
            id: true,
            ci: true,
            first_name: true,
            last_name: true,
            address: { id: true, municipality: true },
          },
        },
        profileActivity: {
          id: true,
          activity: { id: true, code: true },
        },
      },
      relations: {
        profileHiredPerson: {
          hiredPerson: { address: true },
        },
        profileActivity: { activity: true },
      },
      where: {
        profileHiredPerson: {
          profile: { id: profileHiredPerson.profile.id },
        },
      },
    });

    console.log(profileHiredPerson, profileHiredPersonActivity);

    const { section_data: sectionDataJSONString } = dj08ToUpdate;
    const section_data: AllDataSectionsDj08Type = JSON.parse(
      sectionDataJSONString
    );

    const newDataSectionI: { [key: string | number]: DataSectionIType } = {};
    const newTotalSectionI: TotalSectionIType = { import: 0 };

    const profileHiredPersonActivityRemoveDuplicate =
      profileHiredPersonActivity.reduce<{
        [key: string]: ProfileHiredPersonActivity;
      }>((acc, val) => {
        const code = val.profileActivity.activity.code;
        const profileHiredPersonId = val.profileHiredPerson.id;
        if (
          acc[
            `
            ${code}${profileHiredPersonId}`
          ]
        ) {
          acc[
            `
            ${code}${profileHiredPersonId}`
          ].annual_cost += val.annual_cost;
        } else {
          acc[
            `
            ${code}${profileHiredPersonId}`
          ] = val;
        }
        return acc;
      }, {});

    const profileHiredPersonActivityClean = Object.values(
      profileHiredPersonActivityRemoveDuplicate
    );

    for (let i = 0; i < profileHiredPersonActivityClean.length; i++) {
      const { hiredPerson, date_start, date_end } =
        profileHiredPersonActivity[i]?.profileHiredPerson;
      const { ci: nit, first_name, last_name, address } = hiredPerson;
      const { profileActivity, annual_cost } = profileHiredPersonActivity[i];

      const code = profileActivity?.activity.code.padEnd(3);
      const fullName = `${first_name} ${last_name}`;
      const from = [date_start.getDate(), date_start.getMonth() + 1];
      const to = [date_end.getDate(), date_end.getMonth() + 1];
      const dataImport = parseFloat(annual_cost.toFixed());
      const totalImport = parseFloat(
        (newTotalSectionI.import += annual_cost).toFixed()
      );
      const { municipality } = address;

      const data: DataSectionIType = {
        code,
        fullName,
        from,
        to,
        municipality,
        nit,
        import: dataImport,
      };
      newDataSectionI[`F${i + 64}`] = data;
      newTotalSectionI.import = totalImport;
    }
    section_data[SectionName.SECTION_I].data = newDataSectionI;
    section_data[SectionName.SECTION_I].totals = newTotalSectionI;

    dj08ToUpdate.section_data = JSON.stringify(section_data);
    await dj08ToUpdate.save();
  }
}
