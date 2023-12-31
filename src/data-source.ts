import "reflect-metadata";
import { DataSource } from "typeorm";
import { ENV } from "./utils/settings/environment";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: `${ENV.host || "localhost"}`,
  port: ENV.port || 5432,
  username: `${ENV.username || "postgres"}`,
  password: ENV.password,
  database: ENV.database,
  synchronize: true,
  logging: true,
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: [],
});
