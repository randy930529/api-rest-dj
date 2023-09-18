import { cleanEnv, port, str, host } from "envalid";

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
    JWT_SECRET_KEY: str(),
  });
};

export default validateEnv;
