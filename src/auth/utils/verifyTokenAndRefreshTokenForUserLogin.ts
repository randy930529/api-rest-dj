import { Response } from "express";
import { JWT } from "../security/jwt";
import { responseError } from "./responseError";

type Params = {
  token: string;
  refreshToken: string;
};

export async function verifyTokenAndRefreshTokenForUserLogin(
  { token, refreshToken }: Params,
  response: Response,
) {
  if (!JWT.isTokenValid(token)) {
    responseError(response, "JWT is not valid.");
  }

  const jwtId = JWT.getJwtId(token);

  const getRefreshToken = await JWT.getRefreshTokenFindOne({
    id: refreshToken,
  });

  if (!(await JWT.isRefreshTokenLinkedToToken(getRefreshToken, jwtId))) {
    responseError(response, "Token does not match with Refresh Token.");
  }

  if (await JWT.isRefreshTokenExpired(getRefreshToken)) {
    responseError(response, "Refresh Token has expired.");
  }

  if (await JWT.isRefreshTokenUsedOrInvalidated(getRefreshToken)) {
    responseError(response, "Refresh Token has been used or invalidated.");
  }

  return { jwtId, getRefreshToken };
}
