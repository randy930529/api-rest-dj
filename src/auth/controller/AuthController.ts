import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { User } from "../../entity/User";
import { Profile } from "../../entity/Profile";
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
import { userSetPasswordDTO } from "../dto/request/userSetPassword.dto";
import * as moment from "moment";

const transferProtocol: string = "ca-mygestor" as const;
const ACTIVATION_URL = (appName, uid, token) =>
  `${appName}://activate/?uid=${uid}&token=${token}`;
const RESETPASSWORD_URL = (appName, uid, token) =>
  `${appName}://reset_password/?uid=${uid}&token=${token}`;

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);
  private profileRepository = AppDataSource.getRepository(Profile);

  async register(request: Request, response: Response, next: NextFunction) {
    try {
      const body: RegisterDTO = request.body;
      const { email, password, repeatPassword } = body;

      if (password !== repeatPassword) {
        responseError(response, "Repeat password does not match the password.");
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
          responseError(response, "Server is not ready to send your messages.");
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
        user.password
      );

      if (!isPasswordValid) {
        responseError(response, "Invalid credentials.", 401);
      }

      const { token, refreshToken } = await JWT.generateTokenAndRefreshToken(
        user
      );
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

      const { jwtId, getRefreshToken } =
        await verifyTokenAndRefreshTokenForUserLogin(
          { token, refreshToken },
          response
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
    next: NextFunction
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

      if (!user.active) {
        const newProfile = this.profileRepository.create({
          user,
          primary: true,
        });

        user.active = true;
        await this.userRepository.save(user);
        await this.profileRepository.save(newProfile);
      }

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
    next: NextFunction
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
          responseError(response, "Server is not ready to send your messages.");
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
    next: NextFunction
  ) {
    try {
      const body: userSetPasswordDTO = request.body;
      const { email, password, newPassword } = body;

      const userToUpdate = await this.userRepository.findOne({
        where: { email },
      });

      if (!userToUpdate || !email) {
        responseError(response, "The user not already exists.", 409);
      }

      if (!userToUpdate.active) {
        responseError(response, "User not activate.", 401);
      }

      const isPasswordValid = await PasswordHash.isPasswordValid(
        password,
        userToUpdate.password
      );

      if (!isPasswordValid) {
        responseError(response, "Invalid credentials.", 401);
      }

      const hashedNewPassword = await PasswordHash.hashPassword(newPassword);
      const newUpdateDate = moment().toDate();
      userToUpdate.password = hashedNewPassword;
      userToUpdate.password_update_date = newUpdateDate;
      await this.userRepository.save(userToUpdate);

      const user: UserDTO = userToUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { user },
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

  async userResetPassword(
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
        responseError(response, "The user not already exists.", 409);
      }

      const user: UserDTO = existingUser;
      const { token } = await JWT.generateTokenAndRefreshToken(existingUser);
      const confirUrl = RESETPASSWORD_URL(transferProtocol, user.id, token);
      const resp: RegistryDTO = {
        status: "success",
        error: undefined,
        data: { user, confirUrl, token },
      };

      await new Email(existingUser, confirUrl)
        .sendPasswordResetToken()
        .catch((error) => {
          responseError(response, "Server is not ready to send your messages.");
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

  async userResetPasswordConfirm(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const body: RegisterDTO = request.body;
      const { password, repeatPassword } = body;

      if (password !== repeatPassword) {
        responseError(response, "Repeat password does not match the password.");
      }

      const token = request.headers.authorization.split(" ")[1];

      const id = JWT.getJwtPayloadValueByKey(token, "id");

      const userToSetPassword = await this.userRepository.findOne({
        where: { id },
      });

      if (!userToSetPassword) {
        responseError(response, "User does not exist.");
      }

      if (!userToSetPassword.active) {
        responseError(response, "User not activate.", 401);
      }

      const hashedNewPassword = await PasswordHash.hashPassword(password);
      const newUpdateDate = moment().toDate();
      userToSetPassword.password = hashedNewPassword;
      userToSetPassword.password_update_date = newUpdateDate;
      await this.userRepository.save(userToSetPassword);

      const user: UserDTO = userToSetPassword;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { user },
      };

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
}
