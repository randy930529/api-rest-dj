import * as express from "express";
import * as bodyParser from "body-parser";
import "express-async-errors";
import validateEnv from "./utils/settings/validateEnv";
import { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import { Routes } from "./router";
import { errorHandler } from "./errors/middlewares/errorHandler";
import { appConfig } from "../config";
import * as pug from "pug";

//Para provar el envio de correo. Eliminar!
import * as nodemailer from "nodemailer";
if (appConfig.debug === "development") {
  (async function () {
    const credentials = await nodemailer.createTestAccount();
    console.log(credentials);
  })();
}
//

AppDataSource.initialize()
  .then(async () => {
    validateEnv();

    // create express app
    const app = express();
    app.use(bodyParser.json());

    // register express routes from defined application routes
    Routes.forEach((route) => {
      (app as any)[route.method](
        route.route,
        route.middlewares,
        (req: Request, res: Response, next: Function) => {
          const result = new (route.controller as any)()[route.action](
            req,
            res,
            next,
          );
          if (result instanceof Promise) {
            result.then((result) =>
              result !== null && result !== undefined
                ? res.send(result)
                : undefined,
            );
          } else if (result !== null && result !== undefined) {
            res.json(result);
          }
        },
      );
    });

    // Error handling
    app.use(errorHandler);

    // setup express app here
    app.get("/", function (req: Request, res: Response, next: Function) {
      const html = pug.renderFile(`${__dirname}/views/api/index.pug`, {
        title: "API-rest dj",
        url: "logo.empresa",
      });
      res.render(html);
    });

    // TEMPLATE ENGINE
    app.set("view engine", "pug");
    app.set("views", `${__dirname}/utils/views`);

    // start express server
    app.listen(appConfig.port);

    console.log(
      `🚀  Express server has started on port ${appConfig.port}. Server ready at: http://localhost:${appConfig.port}/`,
    );
  })
  .catch((error) => console.log(error));
