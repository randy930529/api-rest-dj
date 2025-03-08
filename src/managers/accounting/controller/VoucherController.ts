import { NextFunction, Request, Response } from "express";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { SupportDocument } from "../../../entity/SupportDocument";
import { Voucher } from "../../../entity/Voucher";
import { responseError } from "../../../errors/responseError";
import { VoucherDTO } from "../dto/request/voucher.dto";
import { CreatedVoucherDTO } from "../dto/response/createdVoucher.dto";

export class VoucherController extends EntityControllerBase<Voucher> {
  constructor() {
    const repository = AppDataSource.getRepository(Voucher);
    super(repository);
  }

  async createVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: VoucherDTO = req.body;
      const { id } = fields.supportDocument;

      const supportDocumentRepository = await AppDataSource.getRepository(
        SupportDocument
      );
      const supportDocument = await supportDocumentRepository.findOneBy({
        id,
      });

      if (!supportDocument)
        responseError(res, "Support document not found.", 404);

      const objectVoucher = Object.assign(new Voucher(), {
        ...fields,
        supportDocument,
      });

      const newVoucher = await this.create(objectVoucher);

      const voucher: CreatedVoucherDTO = newVoucher;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { voucher },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, req, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: Voucher = req.body;
      const { id } = fields;

      if (!id) responseError(res, "Delete voucher requiere id valid.", 404);

      const voucherUpdate = await this.update({ id, res }, fields);

      const voucher: CreatedVoucherDTO = voucherUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { voucher },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async partialUpdateVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: VoucherDTO = req.body;
      const { id } = req.body;

      if (!id) responseError(res, "Delete voucher requiere id valid.", 404);

      const fieldToUpdate: string = Object.keys(fields)[1];
      const voucherToUpdate = await this.one({ id, req, res });

      const voucherUpdateObject = Object.assign(new Voucher(), {
        ...voucherToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      });

      const voucherUpdate = await this.update({ id, res }, voucherUpdateObject);

      const voucher: CreatedVoucherDTO = voucherUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { voucher },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id) responseError(res, "Delete voucher requiere id valid.", 404);

      await this.delete({ id, res });

      res.status(204);
      return "Voucher has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
