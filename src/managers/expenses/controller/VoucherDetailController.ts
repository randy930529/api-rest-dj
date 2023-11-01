import { NextFunction, Request, Response } from "express";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { VoucherDetail } from "../../../entity/VoucherDetail";
import { VoucherDetailDTO } from "../dto/request/voucherDetail.dto";
import { responseError } from "../../../errors/responseError";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { Voucher } from "../../../entity/Voucher";
import { Account } from "../../../entity/Account";

export class VoucherDetailController extends EntityControllerBase<VoucherDetail> {
  constructor() {
    const repository = AppDataSource.getRepository(VoucherDetail);
    super(repository);
  }

  async createVoucherDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: VoucherDetailDTO = req.body;
      const voucherId = fields.voucher.id;
      const accountId = fields.account.id;

      if (!voucherId)
        responseError(res, "Do must provide a valid voucher id.", 404);

      if (!accountId)
        responseError(res, "Do must provide a valid account id.", 404);

      const voucherRepository = AppDataSource.getRepository(Voucher);
      const accountRepository = AppDataSource.getRepository(Account);

      const voucher = await voucherRepository.findOneBy({
        id: voucherId,
      });

      if (!voucher) responseError(res, "Voucher not found.", 404);

      const account = await accountRepository.findOneBy({
        id: accountId,
      });

      if (!account) responseError(res, "Account not found.", 404);

      const objectVoucherDetail = Object.assign(new VoucherDetail(), {
        ...fields,
        voucher,
        account,
      });

      const newVoucherDetail = await this.create(objectVoucherDetail);

      const voucherDetail: VoucherDetailDTO = newVoucherDetail;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { voucherDetail },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onVoucherDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateVoucherDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: VoucherDetail = req.body;
      const { id } = req.body;

      if (!id)
        responseError(res, "Update requiere voucher detail id valid.", 404);

      const voucherDetailUpdate = await this.update({ id, res }, fields);

      const voucherDetail: VoucherDetailDTO = voucherDetailUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { voucherDetail },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async partialUpdateVoucherDetail(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const fields: VoucherDetailDTO = req.body;
      const { id } = req.body;

      if (!id)
        responseError(res, "Update requiere voucher detail id valid.", 404);

      const fieldToUpdate: string = Object.keys(fields)[1];
      const voucherDetailToUpdate = await this.one({ id, res });

      const voucherDetailUpdate = Object.assign(new VoucherDetail(), {
        ...voucherDetailToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      });

      await this.update({ id, res }, voucherDetailUpdate);

      const voucherDetail: VoucherDetailDTO = voucherDetailUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { voucherDetail },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteVoucherDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id)
        responseError(res, "Delete voucher detail requiere one id valid.", 404);

      await this.delete({ id, res });

      res.status(204);
      return "Voucher detail has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
