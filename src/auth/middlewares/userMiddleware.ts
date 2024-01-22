import { NextFunction, Request, Response } from "express";
import { JWT } from "../security/jwt";
import { User } from "../../entity/User";
import { responseError } from "../../errors/responseError";

export const userMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { body } = request;

    const { token } = body;
    const id = JWT.getJwtPayloadValueByKey(token, "id");

    const user: User = await User.findOneBy({ id });

    if (!user) {
      responseError(response, "Authorization token user does not exist.", 404);
    }

    request.body = { ...body, user };

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
