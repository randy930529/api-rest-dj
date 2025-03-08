import * as express from "express";
import { Request, Response } from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as path from "path";
import * as cron from "node-cron";
import "express-async-errors";
import validateEnv from "./utils/settings/validateEnv";
import { AppDataSource } from "./data-source";
import { Routes } from "./router";
import { errorHandler } from "./errors/middlewares/errorHandler";
import { appConfig } from "../config";
import verifyPaymentsNotRegistered from "./api/utils";
// import WebSocketServer, { socketClients } from "./utils/socket";

AppDataSource.initialize()
  .then(async () => {
    validateEnv();

    // create express app
    const app = express();
    app.use(bodyParser.json());
    app.use(cors(appConfig.corsOptions));

    // const { server, wss } = WebSocketServer(app);

    // register express routes from defined application routes
    Routes.forEach((route) => {
      (app as any)[route.method](
        `/api/v1${route.route}`,
        route.middlewares,
        (req: Request, res: Response, next: Function) => {
          const result = new (route.controller as any)()[route.action](
            req,
            res,
            next
          );
          if (result instanceof Promise) {
            result.then((result) =>
              result !== null && result !== undefined
                ? res.send(result)
                : undefined
            );
          } else if (result !== null && result !== undefined) {
            res.json(result);
          }
        }
      );
    });

    // Error handling
    app.use(errorHandler);

    // setup express app here
    app.use(express.static(path.join(__dirname, "../public")));
    app.get(
      "/media/:type/:file",
      function (req: Request, res: Response, next: Function) {
        const { type, file } = req.params;
        const filePath = path.join(
          __dirname,
          "../public",
          `${type ? `${type}/` : ``}`,
          file
        );

        res.sendFile(filePath);
      }
    );

    // setup site web here
    app.use(express.static(path.join(__dirname, "../public/web")));
    app.get("/*", function (req: Request, res: Response, next: Function) {
      const { type = "web", file = "index.html" } = req.params;
      const filePath = path.join(
        __dirname,
        "../public",
        `${type ? `${type}/` : ``}`,
        file
      );

      res.sendFile(filePath);
    });

    // TEMPLATE ENGINE
    app.set("view engine", "pug");
    app.set("views", `${__dirname}/utils/views`);

    // setup CRON JOB
    cron.schedule(appConfig.cronJobTime, async () => {
      verifyPaymentsNotRegistered();
    });

    // start express server
    // server.listen(appConfig.port);
    app.listen(appConfig.port);

    console.log(
      `🚀  Express server has started on port ${appConfig.port}. Server ready at: http://localhost:${appConfig.port}/`
    );
  })
  .catch((error) => console.log(error));
