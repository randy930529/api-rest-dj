import * as dotenv from "dotenv";
dotenv.config();

export const ENV = {
  debug: process.env.NODE_ENV,
  apiPort: process.env.API_PORT,

  //Config JWT.
  secretKey: process.env.JWT_SECRET_KEY,
  tokenLifetime: process.env.ACCESS_TOKEN_LIFETIME,
  refreshTokenLifetime: parseInt(process.env.REFRESH_TOKEN_LIFETIME),

  //Config data base.
  host: process.env.API_DATABASE_HOST,
  database: process.env.API_DATABASE_NAME,
  port: parseInt(process.env.API_DATABASE_PORT),
  username: process.env.API_DATABASE_USER,
  password: process.env.API_DATABASE_PASSWORD,

  //Config smtp client
  emailHost: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
};
