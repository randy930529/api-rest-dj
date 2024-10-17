import * as moment from "moment";
import { ENV } from "../../utils/settings/environment";
import Email from "../../utils/email";
import get from "../../utils/httpClient";
import { appConfig } from "../../../config";
import { StateTMBill } from "../../entity/StateTMBill";
import { NotificationTM, NotiType } from "../../entity/NotificationTM";
import { SectionState } from "../../entity/SectionState";
import {
  PASSWORD_WS_EXTERNAL_PAYMENT,
  PAY_NOTIFICATION_URL,
} from "../../managers/license/utils";
import { PaymentStatusOrderDTO } from "../../managers/license/dto/response/payOrderResult";
import {
  STATE_TMBILL_ORDER,
  STATE_TMBILL_RELATIONS,
  STATE_TMBILL_SELECT,
} from "./query/stateTMBill.fetch";

export async function checkPaymentWhitTM({
  externalId = ":",
  source = ":",
}: {
  externalId: string;
  source: string;
}) {
  const statePaymentTMEndPoint = `/getStatusOrder/${externalId}/${source}`;
  const urlStatePayment = PAY_NOTIFICATION_URL(
    ENV.apiUrlPayment,
    statePaymentTMEndPoint
  );

  const password = PASSWORD_WS_EXTERNAL_PAYMENT(moment().toDate());
  const username = ENV.userPayment;

  const config = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      username,
      source,
      password,
    },
  };

  const tmResponse: PaymentStatusOrderDTO = await get(
    new URL(urlStatePayment),
    config
  );

  const { GetStatusOrderResult } = tmResponse;

  /**
   * Para realizar pruebas con el TM
   */
  const notificacionDTO = NotificationTM.create({
    type: NotiType.RES_EP,
    header: `${JSON.stringify(config.headers)}`,
    body: JSON.stringify(GetStatusOrderResult),
  });

  await notificacionDTO.save();
  /////////////////////////////////////////

  return GetStatusOrderResult;
}

export default async function verifyPaymentsNotRegistered() {
  try {
    const STATE_TMBILL_WHERE = {
      success: false,
      tmBill: { licenseUser: { user: { active: true } } },
    };
    const pendingPayments = await StateTMBill.find({
      select: STATE_TMBILL_SELECT,
      relations: STATE_TMBILL_RELATIONS,
      where: STATE_TMBILL_WHERE,
      order: STATE_TMBILL_ORDER,
    });

    for (const payment of pendingPayments) {
      payment.tmBill?.licenseUser.forEach(async (licenseUser) => {
        const { source } = appConfig.businessMetadata;
        const { licenseKey: externalId } = licenseUser;

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
          licenseUser.user.active = true;
          licenseUser.user.end_license = expirationDate;
          licenseUser.user.max_profiles = Math.max(
            ...[licenseUser.user.max_profiles, licenseUser.license.max_profiles]
          );
          licenseUser.payMentUrl = null;

          payment.success = true;
          payment.tmBill.orderIdTM = TmId;
          payment.tmBill.bankId = BankId;
          payment.tmBill.bank = Bank;

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
          )
            currentSectionState.licenseUser = licenseUser;

          Promise.all([
            licenseUser.save(),
            licenseUser.user.save(),
            currentSectionState.save(),
            payment.save(),
          ]);

          const fechaPago = moment(payment.updated_at).format("DD/MM/YYYY");
          const montoPago = payment.tmBill.import;
          new Email(licenseUser.user, "")
            .sendVerifyStatusPayment({ fechaPago, montoPago })
            .catch(async (error) => {
              /**
               * Para realizar pruebas con el TM
               */
              const notificacionDTO = NotificationTM.create({
                type: NotiType.SMTP,
                body: JSON.stringify(error),
              });

              await notificacionDTO.save();
              /////////////////////////////////////////
            });
        }
      });
    }
  } catch (error) {
    console.error(`\nERROR AL VERIFICAR PAGOS: ${error.message}\n`);
  }
}
