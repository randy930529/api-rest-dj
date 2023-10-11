import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { User } from "../../entity/User";
import { RegisterDTO } from "../dto/request/register.dto";
import { LoginDTO } from "../dto/request/login.dto";
import { PasswordHash } from "../security/passwordHash";
import { RegistryDTO } from "../dto/response/auth/registry.dto";
import { UserDTO } from "../dto/response/auth/user.dto";
import { JWT } from "../security/jwt";
import { AuthenticationDTO } from "../dto/response/auth/authentication.dto";
import { RefreshTokenDTO } from "../dto/request/refreshToken.dto";
import { responseError } from "../utils/responseError";
import Email from "../../utils/email";
import BaseResponseDTO from "../dto/response/base.dto";
import { verifyTokenAndRefreshTokenForUserLogin } from "../utils/verifyTokenAndRefreshTokenForUserLogin";

const transferProtocol: string = "ca-mygestor" as const;
const ACTIVATION_URL = (appName, uid, token) =>
  `${appName}://activate/?uid=${uid}&token=${token}`;

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);

  async register(request: Request, response: Response, next: NextFunction) {
    try {
      const body: RegisterDTO = request.body;
      const { email, password, repeatPassword } = body;

      if (password !== repeatPassword) {
        responseError(
          response,
          "Repeat password does not match the password.",
        );
      }

      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        responseError(response, "The user already exists.", 409);
      }

      const hashedPassword = await PasswordHash.hashPassword(password);
      const newUser = this.userRepository.create({
        email,
        password: hashedPassword,
      });
      await this.userRepository.save(newUser);

      const user: UserDTO = newUser;
      const { token } = await JWT.generateTokenAndRefreshToken(newUser);
      const confirUrl = ACTIVATION_URL(transferProtocol, user.id, token);
      const resp: RegistryDTO = {
        status: "success",
        error: undefined,
        data: { user, confirUrl, token },
      };

      await new Email(newUser, confirUrl)
        .sendVerificationCode()
        .catch((error) => {
          responseError(
            response,
            "Server is not ready to send your messages.",
          );
        });

      response.status(201);
      return { ...resp };
    } catch (error) {
      const resp: RegistryDTO = {
        status: "fail",
        error: {
          message: error.message,
        },
        data: undefined,
      };
      return {
        ...resp,
      };
    }
  }

  async login(request: Request, response: Response, next: NextFunction) {
    try {
      const body: LoginDTO = request.body;
      const { email, password } = body;

      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        responseError(response, "Invalid credentials.", 401);
      }

      if (!user.active) {
        responseError(response, "User not activate.", 401);
      }

      const isPasswordValid = await PasswordHash.isPasswordValid(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        responseError(response, "Invalid credentials.", 401);
      }

      const { token, refreshToken } =
        await JWT.generateTokenAndRefreshToken(user);
      const userDTO: UserDTO = user;
      const resp: AuthenticationDTO = {
        status: "success",
        error: undefined,
        data: { user: userDTO, token, refreshToken },
      };

      response.status(200);
      return { ...resp };
    } catch (error) {
      const resp: RegistryDTO = {
        status: "fail",
        error: {
          message: error.message,
        },
        data: undefined,
      };
      return {
        ...resp,
      };
    }
  }

  async refreshToken(request: Request, response: Response, next: NextFunction) {
    try {
      const body: RefreshTokenDTO = request.body;
      const { token, refreshToken } = body;

      const { jwtId, getRefreshToken } = await verifyTokenAndRefreshTokenForUserLogin(
        { token, refreshToken },
        response,
      );
      if (!jwtId && !getRefreshToken) {
        responseError(response, "User does not login.");
      }

      const user = await this.userRepository.findOne({
        where: { id: JWT.getJwtPayloadValueByKey(token, "id") },
      });
      if (!user) {
        responseError(response, "User does not exist.");
      }

      getRefreshToken.used = true;
      await JWT.refreshTokenRepository.save(getRefreshToken);

      const accessToken = await JWT.generateTokenAndRefreshToken(user);

      const userDTO: UserDTO = user;
      const resp: AuthenticationDTO = {
        status: "success",
        error: undefined,
        data: {
          user: userDTO,
          token: accessToken.token,
          refreshToken: accessToken.refreshToken,
        },
      };

      response.status(200);
      return { ...resp };
    } catch (error) {
      const resp: RegistryDTO = {
        status: "fail",
        error: {
          message: error.message,
        },
        data: undefined,
      };
      return {
        ...resp,
      };
    }
  }

  async jwtVerify(request: Request, response: Response, next: NextFunction) {
    try {
      const { token } = request.body;

      if (!JWT.isTokenValid(token)) {
        responseError(response, "JWT is not valid.");
      }

      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: {
          token,
        },
      };

      response.status(200);
      return { ...resp };
    } catch (error) {
      const resp: BaseResponseDTO = {
        status: "fail",
        error: {
          message: error.message,
        },
        data: undefined,
      };
      return {
        ...resp,
      };
    }
  }

  async userActivation(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    try {
      const token = request.headers.authorization.split(" ")[1];

      const id = JWT.getJwtPayloadValueByKey(token, "id");

      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        responseError(response, "User does not exist.");
      }

      user.active = true;
      await this.userRepository.save(user);

      response.status(200);
      return { message: "Account activated successfully." };
    } catch (error) {
      const resp: RegistryDTO = {
        status: "fail",
        error: {
          message: error.message,
        },
        data: undefined,
      };
      return {
        ...resp,
      };
    }
  }

  async userResendActivation(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    try {
      const { email } = request.body;

      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (!existingUser || !email) {
        responseError(response, "The user not already exists.", 409);
      }

      const user: UserDTO = existingUser;
      const { token } = await JWT.generateTokenAndRefreshToken(existingUser);
      const confirUrl = ACTIVATION_URL(transferProtocol, user.id, token);
      const resp: RegistryDTO = {
        status: "success",
        error: undefined,
        data: { user, confirUrl, token },
      };

      await new Email(existingUser, confirUrl)
        .sendVerificationCode()
        .catch((error) => {
          responseError(
            response,
            "Server is not ready to send your messages.",
          );
        });

      response.status(201);
      return { ...resp };
    } catch (error) {
      const resp: RegistryDTO = {
        status: "fail",
        error: {
          message: error.message,
        },
        data: undefined,
      };
      return {
        ...resp,
      };
    }
  }

  async userSetPassword(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    /*Implementar*/
  }

  async userResetPassword(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    /*Implementar*/
  }

  async userResetPasswordConfirm(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    /*Implementar*/
  }
}
