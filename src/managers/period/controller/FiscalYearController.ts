import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../../../data-source";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { responseError } from "../../../errors/responseError";
import { FiscalYear } from "../../../entity/FiscalYear";
import { VoucherDetail } from "../../../entity/VoucherDetail";
import { Mayor } from "../../../entity/Mayor";
import { Account } from "../../../entity/Account";
import { SupportDocument } from "../../../entity/SupportDocument";
import { SupportDocumentController } from "../../accounting/controller/SupportDocumentController";
import { Dj08SectionData } from "../../../entity/Dj08SectionData";
import getProfileById from "../../../profile/utils/getProfileById";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { FiscalYearDTO } from "../dto/request/fiscalYear.dto";
import { CreateFiscalYearDTO } from "../dto/response/createFiscalYear.dto";
import { defaultSectionDataInit, getInitialBalances } from "../utils";
import {
  getAccountInitialsBalances,
  passPreviousBalanceToInitialBalance,
  updateMayors,
} from "../../accounting/utils";
import {
  DELETE_FISCAL_YEAR_RELATIONS,
  DELETE_FISCAL_YEAR_SELECT,
} from "../utils/query/deleteFiscalYear.fetch";
import { getInitialsBalances } from "../../accounting/utils/query/initialBalance.fetch";
import { getBiggerAccountsInitials } from "../../accounting/utils/query/mayorsTheAccountInToFiscalYear.fetch";
import { getSupportDocumentsToAccounting } from "../utils/query/supportDocumentsToAccounting.fetch";

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

      const fiscalYearToUpdate = await this.repository.findOneBy({ id });

      if (!fiscalYearToUpdate) responseError(res, "FiscalYear not found.", 404);

      const fiscalYearUpdated = this.repository.create({
        ...fiscalYearToUpdate,
        ...fields,
      });
      const fiscalYearUpdate = await this.repository.save(fiscalYearUpdated);

      if (
        fields.run_acounting &&
        !fiscalYearToUpdate.run_acounting &&
        fiscalYearToUpdate.has_documents
      ) {
        await passPreviousBalanceToInitialBalance(fiscalYearUpdate);
        await this.generateAccountingInFiscalYear(fiscalYearUpdate);
      }

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
      const fiscalYear = await this.repository.findOneBy({ id });

      if (!fiscalYear) responseError(res, "Fiscal year not found.", 404);
      if (!fiscalYear.run_acounting)
        responseError(
          res,
          "En años fiscales con contabilidad desactivada, no es admitido."
        );

      const [codeAccountInitials, acountInitials] =
        await getAccountInitialsBalances();

      let [previousBalances, currentInitialBalances] = await Promise.all([
        this.getPreviousMayorsToInitialBalances(
          fiscalYear,
          codeAccountInitials
        ),
        getInitialsBalances(id, codeAccountInitials),
      ]);

      currentInitialBalances = await this.setMayorsToInitialBalances(
        fiscalYear,
        previousBalances,
        currentInitialBalances
      );

      return getInitialBalances(
        acountInitials,
        currentInitialBalances,
        fiscalYear
      );
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
      return;
    }
  }

  private async getPreviousMayorsToInitialBalances(
    fiscalYear: FiscalYear,
    codeAccountInitials: string[]
  ): Promise<Mayor[]> {
    if (!fiscalYear.run_acounting) return;

    const previousFiscalYear = await FiscalYear.findOneBy({
      year: fiscalYear.year - 1,
      profile: { id: fiscalYear.__profileId__ },
    });

    if (!previousFiscalYear) return;

    return await getBiggerAccountsInitials(
      previousFiscalYear?.id,
      codeAccountInitials
    );
  }

  private async setMayorsToInitialBalances(
    fiscalYear: FiscalYear,
    previousBalances: Mayor[],
    currentBalances: Mayor[]
  ): Promise<Mayor[]> {
    if (!currentBalances.length) {
      return await this.createAndGetMayors(fiscalYear, previousBalances);
    } else {
      const mapMayorsToCode = new Map<string, Mayor>();
      for (const mayor of previousBalances) {
        if (!mapMayorsToCode.get(mayor.account.code)) {
          mapMayorsToCode.set(mayor.account.code, mayor);
        }
      }
      return await this.updateAndGetMayors(currentBalances, mapMayorsToCode);
    }
  }

  private async createAndGetMayors(
    fiscalYear: FiscalYear,
    mayors: Mayor[]
  ): Promise<Mayor[]> {
    return await Promise.all(
      mayors.map(({ account, voucherDetail, date, saldo }) => {
        const { debe, haber } = voucherDetail;
        return this.createMayor(fiscalYear, account, date, debe, haber, saldo);
      })
    );
  }

  private async updateAndGetMayors(
    mayors: Mayor[],
    mapMayors: Map<string, Mayor>
  ): Promise<Mayor[]> {
    return await Promise.all(
      mayors.map((val) => this.updateMayor(val, mapMayors))
    );
  }

  private async createMayor(
    fiscalYear: FiscalYear,
    account: Account,
    date: Date,
    debe: number,
    haber: number,
    saldo: number
  ): Promise<Mayor> {
    const newMayor = await Mayor.create({
      date,
      account,
      fiscalYear,
      init_saldo: true,
      saldo,
      voucherDetail: await VoucherDetail.create({
        account,
        debe,
        haber,
      }).save(),
    }).save();

    if (fiscalYear.has_documents) {
      await updateMayors(newMayor);
    }

    return newMayor;
  }

  private async updateMayor(
    mayor: Mayor,
    mapMayors: Map<string, Mayor>
  ): Promise<Mayor> {
    const { fiscalYear, account } = mayor || {};
    const { saldo, voucherDetail } = {
      ...(mapMayors.get(account?.code) || {}),
    };
    const { debe, haber } = voucherDetail || {};
    const updatedMayor = await Mayor.create({
      ...mayor,
      saldo,
      voucherDetail: { ...mayor.voucherDetail, debe, haber },
    }).save();
    await updatedMayor.voucherDetail.save();

    if (fiscalYear?.has_documents) {
      await updateMayors(updatedMayor);
    }

    return updatedMayor;
  }

  private async generateAccountingInFiscalYear(fiscalYear: FiscalYear) {
    const documents = await getSupportDocumentsToAccounting(fiscalYear.id);
    await this.generateAccounting(fiscalYear, documents);
  }

  private async generateAccounting(
    fiscalYear: FiscalYear,
    documents: SupportDocument[]
  ): Promise<void> {
    const run = new SupportDocumentController();

    for (const document of documents) {
      await run.runCuadre({ ...document, fiscalYear } as SupportDocument);
    }
  }
}
