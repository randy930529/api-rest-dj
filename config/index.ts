import * as config from "config";

/**
 * @type
 * Constantes contables son valores predefinidos que se
 * utilizan en diversos cálculos y registros contables.
 *
 * @param
 * MEa_By_MFP Mínimo Exento autorizado por MFP.
 * @param
 * PPD_PERCENTAGE Porciento de bonificación por pronto pago: 5%.
 * @param
 * PE_0_10000 % Escala progresiva – [0-10000]: 15%.
 * @param
 * PE_10000_20000 % Escala progresiva – [10000-20000]: 20%.
 * @param
 * PE_20000_30000 % Escala progresiva – [20000-30000]: 30%.
 * @param
 * PE_30000_50000 % Escala progresiva – [30000-50000]: 40%.
 * @param
 * PE_ABOVE_50000 % Escala progresiva – [Mas de-50000]: 50%.
 *
 */
type accountingConstantsType = {
  MEa_By_MFP?: number;
  PPD_PERCENTAGE?: number;
  PE_0_10000?: number;
  PE_10000_20000?: number;
  PE_20000_30000?: number;
  PE_30000_50000?: number;
  PE_ABOVE_50000?: number;
};

type ConstantToSectionGType = {
  from: number;
  to: number;
  porcentageType: number;
}[];

type businessMetadataType = {
  name: string;
  source: string;
  address: string;
  phone: string;
  email: string;
};

interface AppConfig {
  site: string;
  debug: string;
  port: number;
  emailFrom: string;
  licenseFreeDays: number;
  validTimeTMBill: number;
  currencyTMBill: string;
  paymentAPKHref: string;
  businessMetadata: businessMetadataType;
  accountingConstants: accountingConstantsType;
  constantToSectionG: ConstantToSectionGType;
}

export const appConfig: AppConfig = config.get("app");
