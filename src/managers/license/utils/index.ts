import { ENV } from "../../../utils/settings/environment";
import { appConfig } from "../../../../config";
import generateBase64String from "../../../utils/encrypt";
import * as moment from "moment";

export const PAY_NOTIFICATION_URL = (
  serverName: string,
  endpoint?: string
): string => `${serverName}${endpoint}`;

export const PASSWORD_WS_EXTERNAL_PAYMENT = (date: Date): string => {
  const { userPayment, seedPayment } = ENV;
  const { source } = appConfig.businessMetadata;
  const dateCuba = date.toLocaleString("en-US", {
    timeZone: "America/Havana",
  });

  const day = moment(dateCuba, "M/D/YYYY, h:mm:ss A").date();
  const month = moment(dateCuba, "M/D/YYYY, h:mm:ss A").month() + 1;
  const year = moment(dateCuba, "M/D/YYYY, h:mm:ss A").year();

  const data = `${userPayment}${day}${month}${year}${seedPayment}${source}`;

  return generateBase64String(data);
};
