import * as dotenv from "dotenv";
dotenv.config();

export const ENV = {
  //NODE_ENV = development | test | production | staging
  debug: process.env.NODE_ENV,
  apiPort: process.env.API_PORT,

  //Config JWT.
  secretKey: process.env.JWT_SECRET_KEY,
  tokenLifetime: process.env.ACCESS_TOKEN_LIFETIME,
  refreshTokenLifetime: parseInt(process.env.REFRESH_TOKEN_LIFETIME),

  //Config external payment
  apiUrlPayment: process.env.API_URL_PAYMENT,
  userPayment: process.env.USER_WS_EXTERNAL_PAYMENT,
  seedPayment: process.env.SEED_WS_EXTERNAL_PAYMENT,

  //Config data base.
  host: process.env.API_DATABASE_HOST,
  database: process.env.API_DATABASE_NAME,
  port: parseInt(process.env.API_DATABASE_PORT),
  username: process.env.API_DATABASE_USER,
  password: process.env.API_DATABASE_PASSWORD,

  //Config smtp client
  emailHost: process.env.EMAIL_HOST,
  emailPort: parseInt(process.env.EMAIL_PORT),
  emailSecure: process.env.EMAIL_SECURE === "true",
  emailFrom: process.env.EMAIL_FROM,
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
  tls: {
    rejectUnauthorized: process.env.EMAIL_USING_CERTIFICATE === "true",
  },

  group: {
    expenseId_PD: [14, 15, 16, 17, 18, 19, 20],
  },
};
