import "reflect-metadata";
import { DataSource } from "typeorm";
import { ENV } from "./utils/settings/environment";

const { host, port, username, password, database } = ENV;

export const AppDataSource = new DataSource({
  type: "postgres",
  host,
  port,
  username,
  password,
  database,
  synchronize: true,
  logging: true,
  entities: [`${__dirname}/entity/**/*{.js,.ts}`],
  migrations: [`${__dirname}/migration/**/*{.js,.ts}`],
  subscribers: [],
});
