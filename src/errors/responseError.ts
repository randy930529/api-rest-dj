import { Response } from "express";

export function responseError(
  response: Response,
  message: string = "",
  status: number = 500,
) {
  response.status(status);
  throw new Error(message);
}
