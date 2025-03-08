import { cleanEnv, port, str, host, num, url } from "envalid";

enum NODE_ENV {
  DEVELOPMENT = "development",
  TEST = "test",
  PRODUCTION = "production",
  STAGING = "staging",
}

const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str<NODE_ENV>({
      choices: [
        NODE_ENV.DEVELOPMENT,
        NODE_ENV.TEST,
        NODE_ENV.PRODUCTION,
        NODE_ENV.STAGING,
      ],
    }),
    API_PORT: port({ default: 4000 }),
    API_DATABASE_HOST: host({ default: "localhost" }),
    API_DATABASE_PORT: port({ default: 5432 }),
    API_DATABASE_USER: str({ default: "postgres" }),
    API_DATABASE_PASSWORD: str(),
    API_DATABASE_NAME: str(),
    API_URL_PAYMENT: url(),
    URL_PAY_NOTIFICATION: url(),
    USER_WS_EXTERNAL_PAYMENT: str(),
    SEED_WS_EXTERNAL_PAYMENT: str(),
    JWT_SECRET_KEY: str(),
    MEa_By_MFP: num({ default: 39120.0 }),
    PPD_PERCENTAGE: num({ default: 0.05 }),
    PE_0_10000: num({ default: 0.15 }),
    PE_10000_20000: num({ default: 0.2 }),
    PE_20000_30000: num({ default: 0.3 }),
    PE_30000_50000: num({ default: 0.4 }),
    PE_ABOVE_50000: num({ default: 0.5 }),
  });
};

export default validateEnv;
