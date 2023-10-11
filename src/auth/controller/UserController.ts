import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { User } from "../../entity/User";
import { responseError } from "../utils/responseError";
import { RegistryDTO } from "../dto/response/auth/registry.dto";
import { RefreshTokenDTO } from "../dto/request/refreshToken.dto";
import { verifyTokenAndRefreshTokenForUserLogin } from "../utils/verifyTokenAndRefreshTokenForUserLogin";
import { JWT } from "../security/jwt";
import { UserDTO } from "../dto/response/auth/user.dto";
import BaseResponseDTO from "../dto/response/base.dto";

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  async all(request: Request, response: Response, next: NextFunction) {
    return this.userRepository.find();
  }

  async one(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);

    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      return "Unregistered user.";
    }
    return user;
  }

  async save(request: Request, response: Response, next: NextFunction) {
    const { email, password } = request.body;

    const user = Object.assign(new User(), {
      email,
      password,
    });

    return this.userRepository.save(user);
  }

  async remove(request: Request, response: Response, next: NextFunction) {
    try {
      const id = parseInt(request.params.id);

      await this.destroy(response, id);

      response.status(204);
      return "User has been removed successfully.";
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

  private async retrieve(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    try {
      const body: RefreshTokenDTO = request.body;
      const { token, refreshToken } = body;

      const { getRefreshToken } = await verifyTokenAndRefreshTokenForUserLogin(
        { token, refreshToken },
        response,
      );
      if (!getRefreshToken) {
        responseError(response, "User does not login.");
      }

      const user = await this.userRepository.findOne({
        where: { id: JWT.getJwtPayloadValueByKey(token, "id") },
      });
      if (!user) {
        responseError(response, "User does not exist.");
      }

      const userDTO: UserDTO = user;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: {
          user: userDTO,
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

  private async destroy(response: Response, userId: number) {
    const id = userId;

    if (!id)
      responseError(response, "Destroy user requiere user id valid.", 400);

    let userToRemove = await this.userRepository.findOneBy({ id });

    if (!userToRemove)
      responseError(response, "This user does not exist.", 400);

    await this.userRepository.remove(userToRemove);
  }

  private async delete(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    try {
      const body: RefreshTokenDTO = request.body;
      const { token, refreshToken } = body;

      const { getRefreshToken } = await verifyTokenAndRefreshTokenForUserLogin(
        { token, refreshToken },
        response,
      );
      if (!getRefreshToken) {
        responseError(response, "User does not login.");
      }

      const id = JWT.getJwtPayloadValueByKey(token, "id");

      await this.destroy(response, id);

      response.status(204);
      return "User has been removed successfully.";
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

  async userMe(request: Request, response: Response, next: NextFunction) {
    /*Implementar
    Met:[GET, PUT, PATCH]
    */
    console.log(request.method);
    if (request.method == "GET") {
      this.retrieve(request, response, next);
    } else if (request.method == "PUT") {
      // return this.update()
    } else if (request.method == "PATCH") {
      // return this.partial_update()
    } else if (request.method == "DELETE") {
      this.delete(request, response, next);
    }
  }
}
