import { NextFunction, Request, Response } from "express";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { Account } from "../../../entity/Account";
import { responseError } from "../../../errors/responseError";
// import getProfileById from "../../../profile/utils/getProfileById";
import { AccountDTO } from "../dto/request/account.dto";
import { CreatedAccountDTO } from "../dto/response/createdAccount.dto";

export class AccountController extends EntityControllerBase<Account> {
  constructor() {
    const repository = AppDataSource.getRepository(Account);
    super(repository);
  }

  async createAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: AccountDTO = req.body;
      // const { id } = fields.profile;

      // const profile = await getProfileById({ id, res });

      const objectAccount = Object.assign(new Account(), {
        ...fields,
        // profile,
      });

      const newAccount = await this.create(objectAccount);

      const account: CreatedAccountDTO = newAccount;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { account },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, req, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: CreatedAccountDTO = req.body;
      const { id } = fields;

      if (!id) responseError(res, "Update account requiere id valid.", 404);

      const accountToUpdate = Object.assign(new Account(), {
        ...fields,
      });

      const accountUpdate = await this.update({ id, res }, accountToUpdate);

      const account: CreatedAccountDTO = accountUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { account },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id) responseError(res, "Delete account requiere id valid.", 404);

      await this.delete({ id, res });

      res.status(204);
      return "Account has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
