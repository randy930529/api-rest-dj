import { NextFunction, Request, Response } from "express";
import * as moment from "moment";
import { responseError } from "../../../errors/responseError";

export const licenseMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { user } = request.body;

    if (!user.active) {
      responseError(response, "User not activate.", 401);
    }

    const end_license = user.end_license ?? undefined;
    const isLicenseExpired = moment().isAfter(end_license);

    if (!end_license || isLicenseExpired) {
      responseError(response, "Current license user is expired.", 402);
    }

    next();
  } catch (error) {
    return response.status(402).json({
      status: "fail",
      error: {
        message: error.message,
      },
    });
  }
};
