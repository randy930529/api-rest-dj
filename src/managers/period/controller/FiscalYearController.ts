import { NextFunction, Request, Response } from "express";
import { In } from "typeorm";
import * as moment from "moment";
import { AppDataSource } from "../../../data-source";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { responseError } from "../../../errors/responseError";
import { FiscalYear } from "../../../entity/FiscalYear";
import { VoucherDetail } from "../../../entity/VoucherDetail";
import { Mayor } from "../../../entity/Mayor";
import { Account } from "../../../entity/Account";
import { Dj08SectionData } from "../../../entity/Dj08SectionData";
import getProfileById from "../../../profile/utils/getProfileById";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { FiscalYearDTO } from "../dto/request/fiscalYear.dto";
import { CreateFiscalYearDTO } from "../dto/response/createFiscalYear.dto";
import { defaultSectionDataInit } from "../utils";
import {
  getAccountInitialsBalances,
  passPreviousBalanceToInitialBalance,
  updateMayors,
} from "../../accounting/utils";
import {
  DELETE_FISCAL_YEAR_RELATIONS,
  DELETE_FISCAL_YEAR_SELECT,
} from "../utils/query/deleteFiscalYear.fetch";
import {
  BALANCES_ACCOUNT_RELATIONS,
  BALANCES_ACCOUNT_SELECT,
} from "../utils/query/balancesAccountFiscalYear.fetch";
import { getInitialsBalances } from "../../accounting/utils/query/initialBalance.fetch";
import { getBiggerAccountsInitials } from "../../accounting/utils/query/mayorsTheAccountInToFiscalYear.fetch";

export class FiscalYearController extends EntityControllerBase<FiscalYear> {
  constructor() {
    const repository = AppDataSource.getRepository(FiscalYear);
    super(repository);
  }

  async createFiscalYear(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: FiscalYearDTO = req.body;
      const { id } = fields.profile;

      const profile = await getProfileById({ id, res });

      fields.musicalGroup =
        !fields.individual && fields.musicalGroup
          ? fields.musicalGroup
          : undefined;

      const objectFiscalYear = Object.assign(new FiscalYear(), {
        ...fields,
        profile,
      });

      const newFiscalYear = await this.create(objectFiscalYear);

      const section_data = defaultSectionDataInit();

      const newDj08Data = await Dj08SectionData.create({
        dJ08: { fiscalYear: newFiscalYear, profile: profile },
        section_data,
      });

      await Promise.all([
        newDj08Data.save(),
        passPreviousBalanceToInitialBalance(newFiscalYear),
      ]);

      const fiscalYear: CreateFiscalYearDTO = newFiscalYear;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { fiscalYear },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onFiscalYear(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, req, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateFiscalYear(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: FiscalYear = req.body;
      const { id } = fields;

      if (!id) responseError(res, "Update fiscal year requiere id valid.", 404);

      fields.musicalGroup =
        !fields.individual && fields.musicalGroup
          ? fields.musicalGroup
          : undefined;

      const fiscalYearUpdate = await this.update({ id, res }, fields);

      const fiscalYear: CreateFiscalYearDTO = fiscalYearUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { fiscalYear },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async partialUpdateFiscalYear(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const fields: FiscalYearDTO = req.body;
      const { id } = req.body;

      if (!id) responseError(res, "Update fiscal year requiere id valid.", 404);

      const fieldToUpdate: string = Object.keys(fields)[1];
      const fiscalYearToUpdate = await this.one({ id, req, res });

      const fiscalYearUpdateObject = this.repository.create({
        ...fiscalYearToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      });

      const fiscalYearUpdate = await this.repository.save(
        fiscalYearUpdateObject
      );

      const fiscalYear: CreateFiscalYearDTO = fiscalYearUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { fiscalYear },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteFiscalYear(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id) responseError(res, "Delete fiscal year requiere id valid.", 404);

      const DELETE_FISCAL_YEAR_WHERE = { id };
      await this.deleteOptions(
        {
          select: DELETE_FISCAL_YEAR_SELECT,
          relations: DELETE_FISCAL_YEAR_RELATIONS,
          where: DELETE_FISCAL_YEAR_WHERE,
        },
        res
      );

      res.status(204);
      return "Fiscal year has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteMusicalGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.fiscalYearId);

      if (!id)
        responseError(
          res,
          "Delete the musical group, requiere a fiscal year id valid.",
          404
        );

      const fiscalYearToRemoveMusicalGroup = await this.repository.findOne({
        relations: ["musicalGroup"],
        where: { id },
      });

      if (!fiscalYearToRemoveMusicalGroup)
        responseError(res, "Fiscal year not found.", 404);

      if (fiscalYearToRemoveMusicalGroup.musicalGroup) {
        const { musicalGroup } = fiscalYearToRemoveMusicalGroup;
        fiscalYearToRemoveMusicalGroup.musicalGroup = null;

        await this.repository.save(fiscalYearToRemoveMusicalGroup);
        await musicalGroup.remove();
      }

      res.status(204);
      return "Musical group has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async passBalancesToFiscalYear(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = parseInt(req.params.fiscalYearId);
      const [codeAccountInitials, acountInitials] =
        await getAccountInitialsBalances();
      const fiscalYear = await this.repository.findOneBy({ id });

      const [currentBalances, newBalances] = await Promise.all([
        Account.find({
          select: BALANCES_ACCOUNT_SELECT,
          relations: BALANCES_ACCOUNT_RELATIONS,
          where: {
            code: In(codeAccountInitials),
            mayors: { fiscalYear: { id }, init_saldo: true },
          },
          order: { code: "ASC", id: "ASC" },
        }),
        getBiggerAccountsInitials(id, codeAccountInitials),
      ]);

      const mapBalances = new Map<string, Mayor>();
      for (const balance of newBalances) {
        mapBalances.set(balance.account.code, balance);
      }

      const promises = currentBalances.map(async ({ code, mayors }) => {
        const { voucherDetail, saldo = 0 } = mapBalances.get(code) || {};
        const { debe = 0, haber = 0 } = voucherDetail || {};

        return Promise.all([
          VoucherDetail.create({
            ...mayors[0].voucherDetail,
            debe,
            haber,
          }).save(),
          Mayor.create({
            ...mayors[0],
            saldo,
          }).save(),
        ]);
      });

      const data = await Promise.all(promises);
      if (data) {
        const promises = data.map(([, mayor]) => updateMayors(mayor));
        await Promise.all(promises);
      }

      const mayors = await getInitialsBalances(id, codeAccountInitials);

      return acountInitials.map((account) => {
        const existingMayor = mayors.find(
          (mayor) => mayor.account?.code === account.code
        );

        if (existingMayor) {
          return existingMayor;
        }

        return Mayor.create({
          date: moment(`${fiscalYear.year - 1}-12-31`).toDate(),
          saldo: 0,
          init_saldo: true,
          voucherDetail: {
            debe: 0,
            haber: 0,
            account,
          },
          account,
          fiscalYear,
        });
      });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
      return;
    }
  }
}
