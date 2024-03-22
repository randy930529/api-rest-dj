import { ENV } from "../../../utils/settings/environment";
import { appConfig } from "../../../../config";
import generateBase64String from "../../../utils/encrypt";

export const PAY_NOTIFICATION_URL = (
  serverName: string,
  endpoint?: string
): string => `${serverName}${endpoint}`;

export const PASSWORD_WS_EXTERNAL_PAYMENT = (date: Date): string => {
  const { userPayment, seedPayment } = ENV;
  const { source } = appConfig.businessMetadata;
  const { getDate, getMonth, getFullYear } = date;
  const day = getDate();
  const month = getMonth() + 1;
  const year = getFullYear();

  const data = `${userPayment}${day}${month}${year}${seedPayment}${source}`;

  return generateBase64String(data);
};
