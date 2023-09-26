import * as jwt from "jsonwebtoken";
import * as moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { AppDataSource } from "../../data-source";
import { RefreshToken } from "../../entity/RefreshToken";
import { User } from "../../entity/User";
import { FindOptionsWhere } from "typeorm";
import { ENV } from "../../utils/settings/environment";

const { secretKey, tokenLifetime, refreshTokenLifetime } = ENV;

export class JWT {
  private static privateKey = secretKey;
  public static refreshTokenRepository =
    AppDataSource.getRepository(RefreshToken);

  /**
   * @returns Generate json web token and refresh token.
   */
  public static async generateTokenAndRefreshToken(user: User) {
    const { id, email } = user;

    const payload = { id, email };
    const jwtid = uuidv4();
    const subject = `${id}`;
    const expiresIn = `${tokenLifetime || "1h"}`;

    const options = {
      jwtid,
      subject,
      expiresIn,
    };

    const token = jwt.sign(payload, this.privateKey, options);
    const refreshToken = await this.generateRefreshTokenForUserAndToken(
      user,
      jwtid
    );

    return { token, refreshToken };
  }

  public static async generateRefreshTokenForUserAndToken(
    user: User,
    jwtId: string
  ) {
    const expiry_date = moment()
      .add(refreshTokenLifetime || 10, "d")
      .toDate();

    const refreshToken = this.refreshTokenRepository.create({
      user,
      jwt_id: jwtId,
      expiry_date,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return refreshToken.id;
  }

  public static isTokenValid(token: string) {
    try {
      jwt.verify(token, this.privateKey, {
        ignoreExpiration: false,
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  public static async isRefreshTokenLinkedToToken(
    refreshToken: RefreshToken,
    jwtId: string
  ) {
    if (!refreshToken) return false;

    if (refreshToken.jwt_id !== jwtId) return false;

    return true;
  }

  public static async isRefreshTokenExpired(refreshToken: RefreshToken) {
    if (!refreshToken) throw new Error("Refresh token does not exist.");

    if (moment().isAfter(refreshToken.expiry_date)) return true;

    return false;
  }

  public static async isRefreshTokenUsedOrInvalidated(
    refreshToken: RefreshToken
  ) {
    return refreshToken.used || refreshToken.invalidated;
  }

  public static getJwtId(token: string) {
    const decodedToken = jwt.decode(token);

    return decodedToken["jti"];
  }

  public static getJwtPayloadValueByKey(token: string, key: string) {
    const decodedToken = jwt.decode(token);

    return decodedToken[key];
  }

  public static async getRefreshTokenFindOne(
    options: FindOptionsWhere<RefreshToken>
  ) {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: options,
    });

    if (!refreshToken) throw new Error("Refresh token does not exist.");

    return refreshToken;
  }
}
