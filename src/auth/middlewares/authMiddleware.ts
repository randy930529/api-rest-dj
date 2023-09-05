import { Request, Response, NextFunction } from "express";
import { useResponseError } from "../hooks/useResponseError";
import { JWT } from "../security/jwt";

export const authMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = request.headers;

    if (!authorization) {
      useResponseError(response, "Was not provided confirmation token.");
    }

    if (!authorization.toLowerCase().startsWith("bearer")) {
      useResponseError(response, "Was not provided confirmation scheme.");
    }

    const token = authorization.split(" ")[1];

    if (!token || !JWT.isTokenValid(token)) {
      useResponseError(response, "JWT is not valid.");
    }

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
