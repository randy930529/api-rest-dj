import { Request, Response, NextFunction } from "express";
import { responseError } from "../../errors/responseError";
import { JWT } from "../security/jwt";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";

export const isAdminMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const { authorization } = request.headers;
    const userRepository = AppDataSource.getRepository(User);

    const token = authorization.split(" ")[1];
    const id = JWT.getJwtPayloadValueByKey(token, "id");

    const user = await userRepository.findOne({
      where: { id },
    });

    if (!user) {
      responseError(response, "User does not exist.");
    }

    if (!user.active) {
      responseError(response, "User not activate.", 401);
    }

    if (user.role !== "admin") {
      responseError(
        response,
        "User does not have permission to perform this action",
        401,
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
