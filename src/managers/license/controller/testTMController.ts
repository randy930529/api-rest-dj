import { NextFunction, Request, Response } from "express";
import { CreatePayOrderDTO } from "../dto/request/createPayOrder";
import { PayOrderResultDTO } from "../dto/response/payOrderResult";
import { PayOrderConfirm } from "../../bills/dto/response/payOrderConfirm.dto";
import { LicenseUser } from "../../../entity/LicenseUser";
import { responseError } from "../../../errors/responseError";

export class TestTMController {
  async createPayOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: CreatePayOrderDTO = req.body;

      const { ExternalId: OrderId, Description: Resultmsg } = fields.request;

      const resp: PayOrderResultDTO = {
        PayOrderResult: {
          OrderId,
          Resultmsg,
          Success: true,
        },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);

      return { PayOrderResult: { Resultmsg: `${error}`, Success: false } };
    }
  }

  async tmPayInLine(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: {
        id_transaccion: string;
        importe: number;
        moneda: string;
        numero_proveedor: number;
      } = req.params as unknown as {
        id_transaccion: string;
        importe: number;
        moneda: string;
        numero_proveedor: number;
      };

      const { id_transaccion } = fields;

      const licenseUser: LicenseUser = await LicenseUser.findOneBy({
        licenseKey: id_transaccion,
      });

      if (!licenseUser) responseError(res, "Not valid [id_transaccion].", 404);

      const resp: PayOrderConfirm = {
        Success: "true",
        Resultmsg: "Mensaje ok",
        Status: "1",
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);

      return {
        PayOrderResult: {
          Resultmsg: `${error}`,
          Success: false,
          Status: `${res.statusCode}`,
        },
      };
    }
  }
}
