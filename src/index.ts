import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import { Routes } from "./router";
import { ENV } from "./utils/settings/environment";

//Para provar el envio de correo. Eliminar!
import * as nodemailer from "nodemailer";
if (ENV.debug === "develop") {
  (async function () {
    const credentials = await nodemailer.createTestAccount();
    console.log(credentials);
  })();
}
//

AppDataSource.initialize()
  .then(async () => {
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

    // setup express app here
    const port = ENV.apiPort || 4000;

    // TEMPLATE ENGINE
    app.set("view engine", "pug");
    app.set("views", `${__dirname}/utils/views`);

    // start express server
    app.listen(port);

    console.log(
      `🚀  Express server has started on port ${port}. Server ready at: http://localhost:${port}/`
    );
  })
  .catch((error) => console.log(error));
