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
import { responseError } from "../../errors/responseError";
import Email from "../../utils/email";
import { BaseResponseDTO } from "../dto/response/base.dto";
import { verifyTokenAndRefreshTokenForUserLogin } from "../security/verifyTokenAndRefreshTokenForUserLogin";
import { userSetPasswordDTO } from "../dto/request/userSetPassword.dto";
import { FiscalYear } from "../../entity/FiscalYear";
import * as moment from "moment";

const transferProtocol: string = "ca-mygestor" as const;
const ACTIVATION_URL = (appName, uid, token) =>
  `${appName}://activate/?uid=${uid}&token=${token}`;
const RESETPASSWORD_URL = (appName, uid, token) =>
  `${appName}://reset_password/?uid=${uid}&token=${token}`;

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);
  private profileRepository = AppDataSource.getRepository(Profile);
  private fiscalYearRepository = AppDataSource.getRepository(FiscalYear);

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: RegisterDTO = req.body;
      const { email, password, repeatPassword } = fields;

      if (password !== repeatPassword) {
        responseError(res, "Repeat password does not match the password.");
      }

      const existingUser = await this.userRepository.findOneBy({ email });

      if (existingUser) {
        responseError(res, "The user already exists.", 409);
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
          responseError(res, "Server is not ready to send your messages.");
        });

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: LoginDTO = req.body;
      const { email, password } = fields;

      const user = await this.userRepository.findOneBy({ email });

      if (!user) {
        responseError(res, "Invalid credentials.", 401);
      }

      if (!user.active) {
        responseError(res, "User not activate.", 401);
      }

      const isPasswordValid = await PasswordHash.isPasswordValid(
        password,
        user.password
      );

      if (!isPasswordValid) {
        responseError(res, "Invalid credentials.", 401);
      }

      const { token, refreshToken } = await JWT.generateTokenAndRefreshToken(
        user
      );

      const userDTO: UserDTO = user.toJSON();
      const resp: AuthenticationDTO = {
        status: "success",
        error: undefined,
        data: { user: userDTO, token, refreshToken },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: RefreshTokenDTO = req.body;
      const { token, refreshToken } = fields;

      const { jwtId, getRefreshToken } =
        await verifyTokenAndRefreshTokenForUserLogin(
          { token, refreshToken },
          res
        );
      if (!jwtId && !getRefreshToken) {
        responseError(res, "User does not login.");
      }

      const id = JWT.getJwtPayloadValueByKey(token, "id");
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        responseError(res, "User does not exist.");
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

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async jwtVerify(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;

      if (!JWT.isTokenValid(token)) {
        responseError(res, "JWT is not valid.");
      }

      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: {
          token,
        },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async userActivation(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization.split(" ")[1];

      const id = JWT.getJwtPayloadValueByKey(token, "id");

      const user = await this.userRepository.findOneBy({ id });

      if (!user) {
        responseError(res, "User does not exist.");
      }

      if (!user.active) {
        const newProfile = this.profileRepository.create({
          user,
          primary: true,
        });

        user.active = true;
        user.created_at = moment().toDate();
        await this.userRepository.save(user);
        const profile = await this.profileRepository.save(newProfile);
        const year = moment().year();

        const newFiscalYear = this.fiscalYearRepository.create({
          year,
          profile,
        });
        await this.fiscalYearRepository.save(newFiscalYear);
      }

      res.status(200);
      return { message: "Account activated successfully." };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async userResendActivation(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      const existingUser = await this.userRepository.findOneBy({ email });

      if (!existingUser || !email) {
        responseError(res, "The user not already exists.", 409);
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
          responseError(res, "Server is not ready to send your messages.");
        });

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async userSetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: userSetPasswordDTO = req.body;
      const { password, newPassword } = fields;

      const token = req.headers.authorization.split(" ")[1];

      const id = JWT.getJwtPayloadValueByKey(token, "id");

      const userToUpdate = await this.userRepository.findOneBy({ id });

      if (!userToUpdate) {
        responseError(res, "The user not already exists.", 409);
      }

      if (!userToUpdate.active) {
        responseError(res, "User not activate.", 401);
      }

      const isPasswordValid = await PasswordHash.isPasswordValid(
        password,
        userToUpdate.password
      );

      if (!isPasswordValid) {
        responseError(res, "Invalid credentials.", 401);
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

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async userResetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      const existingUser = await this.userRepository.findOneBy({ email });

      if (!existingUser || !email) {
        responseError(res, "The user not already exists.", 409);
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
          responseError(res, "Server is not ready to send your messages.");
        });

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async userResetPasswordConfirm(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const fields: RegisterDTO = req.body;
      const { password, repeatPassword } = fields;

      if (password !== repeatPassword) {
        responseError(res, "Repeat password does not match the password.");
      }

      const token = req.headers.authorization.split(" ")[1];

      const id = JWT.getJwtPayloadValueByKey(token, "id");

      const userToSetPassword = await this.userRepository.findOneBy({ id });

      if (!userToSetPassword) {
        responseError(res, "User does not exist.");
      }

      if (!userToSetPassword.active) {
        responseError(res, "User not activate.", 401);
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

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
