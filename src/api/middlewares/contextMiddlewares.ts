import { NextFunction, Request, Response } from "express";
import { responseError } from "../../errors/responseError";

export const contextMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { body } = request;
    const context = {};

    request.body = { ...body, context };

    next();
  } catch (error) {
    return response.status(401).json({
      status: "fail",
      error: {
        message: error.message,
      },
    });
  }
};
