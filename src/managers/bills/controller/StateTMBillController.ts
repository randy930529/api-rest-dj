import { NextFunction, Request, Response } from "express";
import * as moment from "moment";
import * as ws from "ws";
import { AppDataSource } from "../../../data-source";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { socketClients } from "../../../utils/socket";
import { StateTMBill } from "../../../entity/StateTMBill";
import { LicenseUser } from "../../../entity/LicenseUser";
import { PayOrderNotificationDTO } from "../dto/request/payOrderNotification.dto";
import { responseError } from "../../../errors/responseError";
import { PayOrderConfirmDTO } from "../dto/response/payOrderConfirm.dto";
import { SectionState } from "../../../entity/SectionState";
import { NotificationTM, NotiType } from "../../../entity/NotificationTM";

export class StateTMBillController extends EntityControllerBase<StateTMBill> {
  constructor() {
    const repository = AppDataSource.getRepository(StateTMBill);
    super(repository);
  }

  async licensePayOrderResult(req: Request, res: Response, next: NextFunction) {
    try {
      /**
       * Para realizar pruebas con el TM
       */
      const notificacionDTO = NotificationTM.create({
        type: NotiType.REQ,
        header: JSON.stringify(req.headers),
        body: JSON.stringify(req.body),
      });

      await notificacionDTO.save();
      /////////////////////////////////////////
      const fields: PayOrderNotificationDTO = req.body;
      const {
        BankId,
        TmId,
        Phone,
        Msg,
        ExternalId: licenseKey,
        Status,
        Bank,
      } = fields;

      const is_paid = Status === "3";

      if (!is_paid) responseError(res, "Payment license user faild.", 404);

      const licenseUser = await LicenseUser.findOne({
        relations: ["tmBill", "license", "user"],
        select: {
          tmBill: { id: true },
          license: { id: true, days: true, max_profiles: true },
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
      const expirationDate =
        end_license && moment(end_license).isBefore(moment())
          ? moment().add(licenseUser.license.days, "d").toDate()
          : moment(end_license).add(licenseUser.license.days, "d").toDate();

      licenseUser.is_paid = is_paid;
      licenseUser.expirationDate = expirationDate;
      licenseUser.user.active = true;
      licenseUser.user.end_license = expirationDate;
      licenseUser.user.max_profiles = licenseUser.license.max_profiles;
      licenseUser.payMentUrl = null;

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
          bankId: BankId,
          bank: Bank,
          phone: Phone,
        },
      });

      const currentSectionState = await SectionState.findOne({
        where: {
          user: {
            id: licenseUser.user.id,
          },
        },
      });

      const newLicenseUser = await licenseUser.save();

      currentSectionState.licenseUser = newLicenseUser;
      currentSectionState.save();
      licenseUser.user.save();

      const stateTMBillUpdate = await stateTMBillDTO.save();

      const resp: PayOrderConfirmDTO = {
        Success: `${stateTMBillUpdate.success}`,
        Resultmsg: `${Msg}.OK`,
        Status: "1",
      };

      const userId = licenseUser.user.id;
      const client = socketClients.get(`${userId}`);
      if (client && client.readyState === ws.OPEN) {
        client.send(JSON.stringify({ userId, licenseKey }));
      }

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async allNotifications(req: Request, res: Response, next: NextFunction) {
    return await NotificationTM.find();
  }
}
