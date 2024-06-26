import { Request, Response, NextFunction } from "express";
import { responseError } from "../../errors/responseError";
import { JWT } from "../security/jwt";

export const authMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = request.headers;
    const { body } = request;

    if (!authorization) {
      responseError(response, "Was not provided confirmation token.");
    }

    if (!authorization.toLowerCase().startsWith("bearer")) {
      responseError(response, "Was not provided confirmation scheme.");
    }

    const token = authorization.split(" ")[1];

    if (!token || !JWT.isTokenValid(token)) {
      responseError(response, "JWT is not valid.");
    }

    request.body = { ...body, token };

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
