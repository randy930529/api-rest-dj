import { Response } from "express";

export function useResponseError(
  response: Response,
  message: string = "",
  status: number = 500
) {
  response.status(status);
  throw new Error(message);
}
