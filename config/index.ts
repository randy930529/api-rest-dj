import * as config from "config";

interface AppConfig {
  site: string;
  debug: string;
  port: number;
  emailFrom: string;
  licenseFreeDays: number;
  businessMetadata: {
    name: string;
    source: number;
    address: string;
    phone: string;
    email: string;
  };
}

export const appConfig: AppConfig = config.get("app");
