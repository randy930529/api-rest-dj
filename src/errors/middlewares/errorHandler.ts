import { BaseResponseDTO } from "../../auth/dto/response/base.dto";
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
    const { statusCode, errors, logging, stack } = err;
    if (logging) {
      console.error(
        JSON.stringify(
          {
            code: statusCode,
            errors,
            stack,
          },
          null,
          2,
        ),
      );
    }

    return res.status(statusCode).send({ errors });
  }

  const resp: BaseResponseDTO = {
    status: "fail",
    error: {
      message: err.message,
    },
    data: undefined,
  };

  return res.send(resp);
}
