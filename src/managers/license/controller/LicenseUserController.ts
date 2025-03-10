import { NextFunction, Request, Response } from "express";
import { FindManyOptions } from "typeorm";
import * as moment from "moment";
import { v4 as uuidv4 } from "uuid";
import get from "../../../utils/httpClient";
import { BaseResponseDTO } from "../../../auth/dto/response/base.dto";
import { responseError } from "../../../errors/responseError";
import { EntityControllerBase } from "../../../base/EntityControllerBase";
import { AppDataSource } from "../../../data-source";
import { LicenseUser } from "../../../entity/LicenseUser";
import { LicenseUserDTO } from "../dto/request/licenseUser.dto";
import { User } from "../../../entity/User";
import { License } from "../../../entity/License";
import { CreateLicenseUserDTO } from "../dto/response/createLicenseUserDTO.dto";
import { TMBill } from "../../../entity/TMBill";
import { StateTMBill } from "../../../entity/StateTMBill";
import { appConfig } from "../../../../config";
import { JWT } from "../../../auth/security/jwt";
import { CreatePayOrderDTO } from "../dto/request/createPayOrder";
import { ENV } from "../../../utils/settings/environment";
import { PayOrderResultDTO } from "../dto/response/payOrderResult";
import { createFindOptions } from "../../../base/utils/createFindOptions";
import { PAY_NOTIFICATION_URL, PASSWORD_WS_EXTERNAL_PAYMENT } from "../utils";
import { NotificationTM, NotiType } from "../../../entity/NotificationTM";
import { checkPaymentWhitTM } from "../../../api/utils";
import { SectionState } from "../../../entity/SectionState";

export class LicenseUserController extends EntityControllerBase<LicenseUser> {
  constructor() {
    const repository = AppDataSource.getRepository(LicenseUser);
    super(repository);
  }

  async allLicenses(req: Request, res: Response, next: NextFunction) {
    try {
      const { body, query } = req;

      const { user }: { user: User } = body;

      if (user.role !== "admin") {
        const options: FindManyOptions<LicenseUser> = createFindOptions(req);
        const { where } = options;

        options["where"] = { ...where, user: { id: user.id } };

        req.query = {
          ...query,
          options: JSON.stringify(options),
        };
      }

      await this.all(req, res, next);
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async createLicenseUser(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: LicenseUserDTO = req.body;
      const { token } = req.body;
      const licenseId = fields.license.id;
      const {
        businessMetadata,
        validTimeTMBill,
        paymentAPKHref,
        currencyTMBill,
      } = appConfig;
      const { source } = businessMetadata;
      const site =
        ENV.debug === "production" ? ENV.urlPayNotification : appConfig.site;

      if (!licenseId)
        responseError(res, "Do must provide a valid license id.", 404);

      const jwtUserId = JWT.getJwtPayloadValueByKey(token, "id");
      const userId: number = fields.user ? fields.user.id : jwtUserId;

      if (!userId) responseError(res, "Do must provide a valid user id.", 404);

      const user = await User.findOne({
        select: ["id", "role"],
        relations: ["profiles"],
        where: { id: userId },
      });

      const license = await License.findOne({
        where: { id: licenseId },
      });

      if (!user) responseError(res, "User not found.", 404);

      if (!license) responseError(res, "License not found.", 404);

      if (user.profiles.length > license.max_profiles)
        responseError(
          res,
          "Your number of current profiles exceeds the maximum number of profiles allowed in the license.",
          409
        );

      if (!license.public && fields.user) {
        const userAdmin = await User.findOne({
          select: ["id", "role"],
          where: { id: jwtUserId },
        });

        if (userAdmin.role !== "admin")
          responseError(
            res,
            "User does not have permission to perform this action.",
            401
          );
      }

      let expirationDate: Date;
      if (license.days)
        expirationDate = moment().add(license.days, "d").toDate();

      const validDate: Date = moment().add(validTimeTMBill, "s").toDate();
      const currency = currencyTMBill;
      const description = "Pago de licencia";
      const importLicense = license.discounts_import || license.import;
      const tmBillDTO = await TMBill.create({
        import: importLicense,
        validDate,
        currency,
        description,
      });

      const stateTMBillDTO = await StateTMBill.create({
        description: tmBillDTO.description || "",
        tmBill: tmBillDTO,
      });

      const stateTMBillEndPoint = "/license/payment/notification";
      const UrlResponse = PAY_NOTIFICATION_URL(site, stateTMBillEndPoint);
      const uuid: string = uuidv4();
      const licenseKey: string = uuid.substring(0, 20);

      const body: CreatePayOrderDTO = {
        request: {
          Amount: tmBillDTO.import,
          Phone: tmBillDTO.phone,
          Currency: tmBillDTO.currency,
          Description: tmBillDTO.description,
          ExternalId: licenseKey,
          Source: source,
          UrlResponse,
          ValidTime: validTimeTMBill,
        },
      };

      const password = PASSWORD_WS_EXTERNAL_PAYMENT(moment().toDate());
      const username = ENV.userPayment;

      const config = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          username,
          source,
          password,
        },
        body: JSON.stringify(body),
      };

      const urlPayOrder = PAY_NOTIFICATION_URL(ENV.apiUrlPayment, "/payOrder");

      const tmResponse = await get(new URL(urlPayOrder), config);

      const { PayOrderResult }: PayOrderResultDTO =
        (await tmResponse) as unknown as PayOrderResultDTO;

      /**
       * Para realizar pruebas con el TM
       */
      const notificacionDTO = NotificationTM.create({
        type: NotiType.RES,
        header: `${JSON.stringify(config.headers)} // ${config.body}`,
        body: JSON.stringify(PayOrderResult),
      });

      await notificacionDTO.save();
      /////////////////////////////////////////

      const successPayOrder = PayOrderResult.Success;

      if (!successPayOrder) responseError(res, PayOrderResult.Resultmsg);

      const stateTMBill = await stateTMBillDTO.save();
      const tmBill = stateTMBill.tmBill;

      const payMentUrl = PAY_NOTIFICATION_URL(
        paymentAPKHref,
        `/tm_compra_en_linea/action?id_transaccion=${licenseKey}&importe=${tmBill.import}&moneda=CUP&numero_proveedor=${source}`
      );

      const objectLicenseUser = Object.assign(new LicenseUser(), {
        ...fields,
        user,
        license,
        licenseKey,
        expirationDate,
        tmBill,
        max_profiles: license.max_profiles,
        payMentUrl,
      });

      const newLicenseUser = await this.create(objectLicenseUser);

      const licenseUser: CreateLicenseUserDTO = {
        ...newLicenseUser,
        user: undefined,
        expirationDate: undefined,
      };
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { licenseUser },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onLicenseUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      const licenseUser: LicenseUser = await this.one({ id, req, res });

      return licenseUser;
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateLicenseUser(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: LicenseUser = req.body;
      const { id } = req.body;

      if (!id)
        responseError(res, "Update license user requiere id valid.", 404);

      const licenseUserUpdate = await this.update({ id, res }, fields);

      const licenseUser: LicenseUserDTO = licenseUserUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { licenseUser },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async partialUpdateLicenseUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const fields: LicenseUserDTO = req.body;
      const { id } = req.body;

      if (!id)
        responseError(res, "Update license user requiere id valid.", 404);

      const fieldToUpdate: string = Object.keys(fields)[1];
      const licenseUserToUpdate = await this.one({ id, req, res });

      const licenseUserUpdateObject = Object.assign(new LicenseUser(), {
        ...licenseUserToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      });

      const licenseUserUpdate = await this.update(
        { id, res },
        licenseUserUpdateObject
      );

      const licenseUser: LicenseUserDTO = licenseUserUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { licenseUser },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteLicenseUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id)
        responseError(res, "Delete license user requiere id valid.", 404);

      await this.delete({ id, res });

      res.status(204);
      return "License user has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async verifyStatusPaymentLicense(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = parseInt(req.params.id);

      const licenseUser = await LicenseUser.findOne({
        relations: {
          tmBill: { stateTMBills: true },
          license: true,
          user: true,
        },
        select: {
          tmBill: { id: true, stateTMBills: { id: true } },
          license: { id: true, days: true, max_profiles: true },
          user: {
            id: true,
            active: true,
            end_license: true,
            max_profiles: true,
          },
        },
        where: { id, user: { active: true } },
      });

      if (!licenseUser)
        responseError(res, "License user requiere id valid.", 404);

      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { licenseUser },
      };

      if (licenseUser && !licenseUser.is_paid) {
        const { licenseKey: externalId } = licenseUser;
        const { source } = appConfig.businessMetadata;

        const payCompleted = await checkPaymentWhitTM({ externalId, source });
        if (payCompleted.Success) {
          const { TmId, BankId, Bank } = payCompleted;
          const end_license = licenseUser.user.end_license ?? undefined;
          const expirationDate =
            end_license && moment(end_license).isBefore(moment())
              ? moment().add(licenseUser.license.days, "d").toDate()
              : moment(end_license).add(licenseUser.license.days, "d").toDate();

          licenseUser.is_paid = true;
          licenseUser.expirationDate = expirationDate;
          licenseUser.user.end_license = expirationDate;
          licenseUser.payMentUrl = null;

          licenseUser.tmBill.stateTMBills = licenseUser.tmBill.stateTMBills.map(
            (val) =>
              ({
                ...val,
                success: true,
              } as StateTMBill)
          );
          licenseUser.tmBill.orderIdTM = TmId;
          licenseUser.tmBill.bankId = BankId;
          licenseUser.tmBill.bank = Bank;

          const currentSectionState = await SectionState.findOne({
            where: {
              user: {
                id: licenseUser.user.id,
              },
            },
          });

          if (
            end_license &&
            moment(end_license).isBefore(moment(licenseUser.created_at))
          ) {
            licenseUser.user.max_profiles = Math.max(
              ...[
                licenseUser.user.max_profiles,
                licenseUser.license.max_profiles,
              ]
            );
            currentSectionState.licenseUser = licenseUser;
          }

          const data = await Promise.all([
            licenseUser.save(),
            licenseUser.user.save(),
            ...licenseUser.tmBill.stateTMBills.map((val) => val.save),
            currentSectionState.save(),
          ]);

          resp.data["licenseUser"] = data[0];

          res.status(201);
          return { ...resp };
        } else {
          res.status(402);
          return { ...resp };
        }
      }

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
