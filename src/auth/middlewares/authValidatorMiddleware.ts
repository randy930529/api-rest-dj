import { NextFunction, Request, Response } from "express";
import userScheme from "../schema/userSchema";

export const authParserMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { email, password } = request.body;
  try {
    await userScheme.validateAsync({ email, password });
    next();
  } catch (error) {
    if (error instanceof Error) {
      return response.status(400).json({
        errors: error.message,
      });
    }
    next(error);
  }
};
