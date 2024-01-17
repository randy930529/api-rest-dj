import * as config from "config";

interface AppConfig {
  site: string;
  debug: string;
  port: number;
  emailFrom: string;
}

export const appConfig: AppConfig = config.get("app");
