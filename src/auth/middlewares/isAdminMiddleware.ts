import { Request, Response, NextFunction } from "express";
import { responseError } from "../../errors/responseError";
import { UserRole } from "../../entity/User";

export const isAdminMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { user } = request.body;

    if (!user.active) {
      responseError(response, "User not activate.", 401);
    }

    if (user.role !== UserRole.ADMIN) {
      responseError(
        response,
        "User does not have permission to perform this action.",
        401
      );
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
