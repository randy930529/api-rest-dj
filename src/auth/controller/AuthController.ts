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
import { useResponseError } from "../hooks/useResponseError";
import Email from "../../utils/email";

const ACTIVATION_URL = (uid, token) => `#/activate/${uid}/${token}`;

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);

  async register(request: Request, response: Response, next: NextFunction) {
    try {
      const body: RegisterDTO = request.body;
      const { email, password, repeatPassword } = body;

      if (password !== repeatPassword) {
        useResponseError(
          response,
          "Repeat password does not match the password."
        );
      }

      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        useResponseError(response, "The user already exists.", 409);
      }

      const hashedPassword = await PasswordHash.hashPassword(password);
      const newUser = this.userRepository.create({
        email,
        password: hashedPassword,
      });
      await this.userRepository.save(newUser);

      const user: UserDTO = newUser;
      const { token } = await JWT.generateTokenAndRefreshToken(newUser);
      const confirUrl = ACTIVATION_URL(user.id, token);
      const resp: RegistryDTO = {
        status: "success",
        error: null,
        data: { user, confirUrl, token },
      };

      await new Email(newUser, confirUrl)
        .sendVerificationCode()
        .catch((error) => {
          useResponseError(
            response,
            "Server is not ready to send your messages."
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
        data: null,
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
        useResponseError(response, "Invalid credentials.", 401);
      }

      if (!user.active) {
        useResponseError(response, "User not activate.", 401);
      }

      const isPasswordValid = await PasswordHash.isPasswordValid(
        password,
        user.password
      );

      if (!isPasswordValid) {
        useResponseError(response, "Invalid credentials.", 401);
      }

      const { token, refreshToken } = await JWT.generateTokenAndRefreshToken(
        user
      );
      const userDTO: UserDTO = user;
      const resp: AuthenticationDTO = {
        status: "success",
        error: null,
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
        data: null,
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

      if (!JWT.isTokenValid(token)) {
        useResponseError(response, "JWT is not valid.");
      }

      const jwtId = JWT.getJwtId(token);

      const user = await this.userRepository.findOne({
        where: { id: JWT.getJwtPayloadValueByKey(token, "id") },
      });
      if (!user) {
        useResponseError(response, "User does not exist.");
      }

      const getRefreshToken = await JWT.getRefreshTokenFindOne({
        id: refreshToken,
      });

      if (!(await JWT.isRefreshTokenLinkedToToken(getRefreshToken, jwtId))) {
        useResponseError(response, "Token does not match with Refresh Token.");
      }

      if (await JWT.isRefreshTokenExpired(getRefreshToken)) {
        useResponseError(response, "Refresh Token has expired.");
      }

      if (await JWT.isRefreshTokenUsedOrInvalidated(getRefreshToken)) {
        useResponseError(
          response,
          "Refresh Token has been used or invalidated."
        );
      }

      getRefreshToken.used = true;
      await JWT.refreshTokenRepository.save(getRefreshToken);

      const accessToken = await JWT.generateTokenAndRefreshToken(user);

      const userDTO: UserDTO = user;
      const resp: AuthenticationDTO = {
        status: "success",
        error: null,
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
        data: null,
      };
      return {
        ...resp,
      };
    }
  }

  async jwtVerify(request: Request, response: Response, next: NextFunction) {
    /*Implementar*/
  }

  async userActivation(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const token = request.headers.authorization.split(" ")[1];

      const id = JWT.getJwtPayloadValueByKey(token, "id");

      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        useResponseError(response, "User does not exist.");
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
        data: null,
      };
      return {
        ...resp,
      };
    }
  }

  async userResendActivation(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const { email } = request.body;

      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (!existingUser || !email) {
        useResponseError(response, "The user not already exists.", 409);
      }

      const user: UserDTO = existingUser;
      const { token } = await JWT.generateTokenAndRefreshToken(existingUser);
      const confirUrl = ACTIVATION_URL(user.id, token);
      const resp: RegistryDTO = {
        status: "success",
        error: null,
        data: { user, confirUrl, token },
      };

      await new Email(existingUser, confirUrl)
        .sendVerificationCode()
        .catch((error) => {
          useResponseError(
            response,
            "Server is not ready to send your messages."
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
        data: null,
      };
      return {
        ...resp,
      };
    }
  }

  async userMe(request: Request, response: Response, next: NextFunction) {
    /*Implementar
    Met:[GET, PUT, PATCH]
    */
    console.log(request.method);
  }

  async userSetPassword(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    /*Implementar*/
  }

  async userResetPassword(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    /*Implementar*/
  }

  async userResetPasswordConfirm(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    /*Implementar*/
  }
}
