import { NextFunction, Request, Response } from "express";
import { CreatePayOrderDTO } from "../dto/request/createPayOrder";
import { PayOrderResultDTO } from "../dto/response/payOrderResult";
import { PayOrderConfirmDTO } from "../../bills/dto/response/payOrderConfirm.dto";
import { LicenseUser } from "../../../entity/LicenseUser";
import { responseError } from "../../../errors/responseError";
import { PayOrderNotificationDTO } from "../../bills/dto/request/payOrderNotification.dto";
import { appConfig } from "../../../../config";
import get from "../../../utils/httpClient";

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
      } = req.query as unknown as {
        id_transaccion: string;
        importe: number;
        moneda: string;
        numero_proveedor: number;
      };

      const { id_transaccion, numero_proveedor } = fields;

      const licenseUser: LicenseUser = await LicenseUser.findOneBy({
        licenseKey: id_transaccion,
      });

      if (!licenseUser) responseError(res, "Not valid [id_transaccion].", 404);

      const body: PayOrderNotificationDTO = {
        Source: `${numero_proveedor}`,
        Phone: "53xxxxxxxx",
        Msg: "Mensaje ok",
        ExternalId: id_transaccion,
        Bank: "BANDEC/BPA",
        BankId: `1234`,
        Status: "1",
        TmId: "4567",
      };

      const config = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      };

      const tmResponse = await get(
        new URL(`${appConfig.site}/license/payment/notification`),
        config
      );
      const resp: PayOrderConfirmDTO =
        (await tmResponse) as unknown as PayOrderConfirmDTO;

      if (!resp)
        responseError(res, "Fetch error to connect with api comercio.");

      if (resp.Status !== "1" || resp.Success !== "true")
        responseError(res, `Payment faild. ${JSON.stringify(resp)}`);

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);

      return {
        PayOrderResult: {
          Resultmsg: `${error.message}`,
          Success: false,
          Status: `${res.statusCode}`,
        },
      };
    }
  }
}
