import { NextFunction, Request, Response } from "express";
import * as moment from "moment";
import { AppDataSource } from "../../../data-source";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { StateTMBill } from "../../../entity/StateTMBill";
import { LicenseUser } from "../../../entity/LicenseUser";
import { PayOrderResult } from "../dto/request/payOrderResult.dto";
import { responseError } from "../../../errors/responseError";
import { PayOrderConfirm } from "../dto/response/payOrderConfirm.dto";

export class StateTMBillController extends EntityControllerBase<StateTMBill> {
  constructor() {
    const repository = AppDataSource.getRepository(StateTMBill);
    super(repository);
  }

  async licensePayOrderResult(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: PayOrderResult = req.body.PayOrderResult;
      const {
        Source, //Verificar con el de la mypime
        BankId,
        TmId,
        Phone,
        Msg,
        ExternalId: licenseKey,
        Status,
        Bank,
      } = fields;

      const is_paid = Status === "1";

      if (!is_paid) responseError(res, "Payment license user faild.", 404);

      const licenseUser = await LicenseUser.findOne({
        relations: ["tmBill", "license"],
        select: {
          tmBill: { id: true },
          license: { days: true },
        },
        where: { licenseKey },
      });

      licenseUser.is_paid = is_paid;
      licenseUser.expirationDate = moment()
        .add(licenseUser.license.days, "d")
        .toDate();

      const tmBill = licenseUser.tmBill;
      const stateTMBill = await StateTMBill.findOne({
        relations: ["tmBill"],
        where: { tmBill: { id: tmBill.id } },
      });

      const stateTMBillDTO = await StateTMBill.create({
        ...stateTMBill,
        description: Msg || "",
        success: is_paid,
        tmBill: {
          ...tmBill,
          orderIdTM: TmId,
          bankId: parseInt(BankId),
          bank: Bank,
          phone: Phone,
        },
      });

      await licenseUser.save();
      const stateTMBillUpdate = await stateTMBillDTO.save();

      const resp: PayOrderConfirm = {
        Success: `${stateTMBillUpdate.success}`,
        Resultmsg: `${Msg}.OK`,
        Status,
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
