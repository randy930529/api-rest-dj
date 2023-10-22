import { NextFunction, Request, Response } from "express";
import { CustomError } from "../CustomError";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof CustomError) {
    const { statusCode, errors, logging } = err;
    if (logging) {
      console.error(
        JSON.stringify(
          {
            code: err.statusCode,
            errors: err.errors,
            stack: err.stack,
          },
          null,
          2,
        ),
      );
    }

    return res.status(statusCode).send({ errors });
  }

  res.status(500);
  res.render("error", { error: err });
  //return res.status(500).send({ errors: [{ message: "Something went wrong" }] });
}
