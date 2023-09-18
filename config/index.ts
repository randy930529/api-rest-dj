import * as config from "config";

interface AppConfig {
  debug: string;
  port: number;
}

interface PostgresConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

interface jwt {
  secretKey: string;
  tokenLifetime: string;
  refreshTokenLifetime: number;
}

interface smtp {
  emailHost: string;
  emailPort: number;
  emailSecure: boolean;
  emailFrom: string;
  auth: {
    user: string;
    pass: string;
  };
}

export const appConfig: AppConfig = config.get("app");
export const databaseConfig: PostgresConfig = config.get("ENV.postgresConfig");
export const accessTokenExpiresIn: string = config.get("ENV.jwt.tokenLifetime");
