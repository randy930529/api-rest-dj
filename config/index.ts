import * as config from "config";

interface AppConfig {
  debug: string;
  port: number;
}

export const appConfig: AppConfig = config.get("app");
