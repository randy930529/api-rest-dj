import { NextFunction, Request, Response } from "express";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { Account } from "../../../entity/Account";
import { responseError } from "../../../errors/responseError";
import getProfileById from "../../../profile/utils/getProfileById";
import { AccountDTO } from "../dto/request/account.dto";
import { CreateAccountDTO } from "../dto/response/createAccount.dto";

export class AccountController extends EntityControllerBase<Account> {
  constructor() {
    const repository = AppDataSource.getRepository(Account);
    super(repository);
  }

  async createAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: AccountDTO = req.body;
      const { id } = fields.profile;

      const profile = await getProfileById({ id, res });

      const objectAccount = Object.assign(new Account(), {
        ...fields,
        profile,
      });

      const newAccount = await this.create(objectAccount);

      const account: CreateAccountDTO = newAccount;
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

      return await this.one({ id, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: Account = req.body;
      const { id } = fields;

      if (!id) responseError(res, "Delete account requiere id valid.", 404);

      const accountUpdate = await this.update({ id, res }, fields);

      const account: CreateAccountDTO = accountUpdate;
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

  async partialUpdateAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: AccountDTO = req.body;
      const { id } = req.body;

      if (!id) responseError(res, "Delete account requiere id valid.", 404);

      const fieldToUpdate: string = Object.keys(fields)[1];
      const accountToUpdate = await this.one({ id, res });

      const accountUpdateObject = Object.assign(new Account(), {
        ...accountToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      });

      const accountUpdate = await this.update({ id, res }, accountUpdateObject);

      const account: CreateAccountDTO = accountUpdate;
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
