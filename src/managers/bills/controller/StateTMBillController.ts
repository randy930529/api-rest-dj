import { NextFunction, Request, Response } from "express";
import * as moment from "moment";
import { AppDataSource } from "../../../data-source";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { StateTMBill } from "../../../entity/StateTMBill";
import { LicenseUser } from "../../../entity/LicenseUser";
import { PayOrderResult } from "../dto/request/payOrderResult.dto";
import { responseError } from "../../../errors/responseError";
import { PayOrderConfirm } from "../dto/response/payOrderConfirm.dto";
import { SectionState } from "../../../entity/SectionState";

export class StateTMBillController extends EntityControllerBase<StateTMBill> {
  constructor() {
    const repository = AppDataSource.getRepository(StateTMBill);
    super(repository);
  }

  async licensePayOrderResult(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: PayOrderResult = req.body.PayOrderResult;
      const {
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
        relations: ["tmBill", "license", "user"],
        select: {
          tmBill: { id: true },
          license: { days: true, max_profiles: true },
          user: {
            id: true,
            active: true,
            end_license: true,
            max_profiles: true,
          },
        },
        where: { licenseKey },
      });

      const end_license = licenseUser.user.end_license ?? undefined;
      const expirationDate = moment(end_license)
        .add(licenseUser.license.days, "d")
        .toDate();

      licenseUser.is_paid = is_paid;
      licenseUser.expirationDate = expirationDate;
      licenseUser.user.active = true;
      licenseUser.user.end_license = expirationDate;
      licenseUser.user.max_profiles = licenseUser.license.max_profiles;

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

      const currentSectionState = await SectionState.findOne({
        relations: ["user"],
        where: {
          user: {
            id: licenseUser.user.id,
          },
        },
      });

      const newLicenseUser = await licenseUser.save();

      currentSectionState.license = newLicenseUser;
      currentSectionState.save();

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
