import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../../../data-source";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { FiscalYearEnterprise } from "../../../entity/FiscalYearEnterprise";
import { FiscalYearEnterpriseDTO } from "../dto/fiscalYearEnterprise.dto";
import { Enterprise } from "../../../entity/Enterprise";
import { responseError } from "../../../errors/responseError";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { FiscalYear } from "../../../entity/FiscalYear";
import { SectionState } from "../../../entity/SectionState";
import { Dj08SectionData, SectionName } from "../../../entity/Dj08SectionData";
import {
  AllDataSectionsDj08Type,
  DataSectionHType,
  TotalSectionHType,
} from "../../../utils/definitions";

export class FiscalYearEnterpriseController extends EntityControllerBase<FiscalYearEnterprise> {
  constructor() {
    const repository = AppDataSource.getRepository(FiscalYearEnterprise);
    super(repository);
  }

  async createProfileEnterprise(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const fields: FiscalYearEnterpriseDTO = req.body;
      const fiscalYearId = fields.fiscalYear?.id;
      const enterpriseId = fields.enterprise?.id;

      const fiscalYear = await FiscalYear.findOneBy({ id: fiscalYearId });
      const enterprise = await Enterprise.findOneBy({ id: enterpriseId });

      if (!fiscalYear)
        responseError(res, "Fiscal year requiere id valid.", 404);
      if (!enterprise) responseError(res, "Enterprise requiere id valid.", 404);

      const objectFiscalYearEnterprise = Object.assign(
        new FiscalYearEnterprise(),
        {
          ...fields,
          enterprise,
          fiscalYear,
        }
      );

      const newFiscalYearEnterprise = await this.create(
        objectFiscalYearEnterprise
      );
      await this.updatedDJ08(newFiscalYearEnterprise);

      const profileEnterprise: FiscalYearEnterpriseDTO =
        newFiscalYearEnterprise;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profileEnterprise },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onProfileEnterprise(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, req, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateProfileEnterprise(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const fields: FiscalYearEnterprise = req.body;
      const { id } = fields;

      if (!id)
        responseError(res, "Update profile enterprise requiere id valid.", 404);

      const fiscalYearEnterpriseUpdate = await this.update({ id, res }, fields);
      await this.updatedDJ08(fiscalYearEnterpriseUpdate);

      const profileEnterprise: FiscalYearEnterpriseDTO =
        fiscalYearEnterpriseUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profileEnterprise },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteProfileEnterprise(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = parseInt(req.params.id);

      if (!id)
        responseError(res, "Delete profile enterprise requiere id valid.", 404);

      const removeFiscalYearEnterprise = await this.delete({ id, res });
      await this.updatedDJ08(removeFiscalYearEnterprise);

      res.status(204);
      return "Profile enterprise has been removed successfully.";
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
  private async updatedDJ08(
    fiscalYearEnterprise: FiscalYearEnterprise
  ): Promise<void> {
    const fiscalYearId = fiscalYearEnterprise.__fiscalYearId__;
    const section = await SectionState.findOne({
      select: { profile: { id: true } },
      relations: ["profile"],
      where: { fiscalYear: { id: fiscalYearId } },
    });
    const profileId = section.profile?.id;

    const dj08ToUpdate = await Dj08SectionData.findOne({
      where: {
        dJ08: {
          profile: { id: profileId },
          fiscalYear: { id: fiscalYearId },
        },
        is_rectification: true,
      },
    });

    const fiscalYearEnterprises =
      (
        await FiscalYear.findOne({
          select: {
            fiscalYearEnterprise: {
              id: true,
              amount: true,
              import: true,
              enterprise: { id: true, name: true },
            },
          },
          relations: { fiscalYearEnterprise: { enterprise: true } },
          where: { id: fiscalYearId },
        })
      )?.fiscalYearEnterprise || [];

    const { section_data: sectionDataJSONString } = dj08ToUpdate;
    const section_data: AllDataSectionsDj08Type = JSON.parse(
      sectionDataJSONString
    );

    const newDataSectionH: { [key: string | number]: DataSectionHType } = {};
    const newTotalSectionH: TotalSectionHType = { valueHire: 0, import: 0 };

    const fiscalYearEnterprisesRemoveDuplicate = fiscalYearEnterprises.reduce<{
      [key: string]: FiscalYearEnterprise;
    }>((acc, val) => {
      const porcentage =
        val.amount > 0
          ? parseFloat(((val.import / val.amount) * 100).toFixed(2))
          : null;

      const key = `${val.enterprise.id}${porcentage}`;
      if (acc[key]) {
        acc[key].amount += val.amount;
        acc[key].import += val.import;
      } else {
        acc[key] = val;
      }

      return acc;
    }, {});

    const fiscalYearEnterprisesClean = Object.values(
      fiscalYearEnterprisesRemoveDuplicate
    );

    for (let i = 0; i < fiscalYearEnterprisesClean.length; i++) {
      const {
        amount,
        import: importP,
        enterprise,
      } = fiscalYearEnterprisesClean[i];

      let valueHire = parseFloat(amount.toFixed());
      let importHire = parseFloat(importP.toFixed());
      const porcentage =
        amount > 0 ? parseFloat(((importP / amount) * 100).toFixed(2)) : null;

      const data: DataSectionHType = {
        enterprise: enterprise.name,
        valueHire,
        import: importHire,
        porcentage,
      };

      newDataSectionH[`F${i + 52}`] = data;
      newTotalSectionH.valueHire += valueHire;
      newTotalSectionH.import += importHire;
    }

    section_data[SectionName.SECTION_H].data = newDataSectionH;
    section_data[SectionName.SECTION_H].totals = newTotalSectionH;

    dj08ToUpdate.section_data = JSON.stringify(section_data);
    await dj08ToUpdate.save();
  }
}
