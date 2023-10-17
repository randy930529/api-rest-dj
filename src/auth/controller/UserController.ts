import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { User } from "../../entity/User";
import { responseError } from "../utils/responseError";
import { RegistryDTO } from "../dto/response/auth/registry.dto";
import { JWT } from "../security/jwt";
import { UserDTO } from "../dto/response/auth/user.dto";
import BaseResponseDTO from "../dto/response/base.dto";
import { UpdateDTO } from "../dto/request/update.dto";
import { Profile } from "../../entity/Profile";
import { UserWhitProfileDTO } from "../dto/response/auth/userWhitProfile.dto";

export class UserController {
  private userRepository = AppDataSource.getRepository(User);
  private profileRepository = AppDataSource.getRepository(Profile);

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
    next: NextFunction
  ) {
    try {
      const token = request.headers.authorization.split(" ")[1];

      if (!JWT.isTokenValid(token)) {
        responseError(response, "JWT is not valid.");
      }

      const user = await this.userRepository.findOne({
        where: { id: JWT.getJwtPayloadValueByKey(token, "id") },
      });

      if (!user) {
        responseError(response, "User does not exist.");
      }

      const profiles = await this.profileRepository.find({
        where: {
          user: {
            id: user.id,
          },
        },
      });

      const userDTO: UserWhitProfileDTO = { ...user.toJSON(), profiles };
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
    next: NextFunction
  ) {
    try {
      const token = request.headers.authorization.split(" ")[1];

      if (!JWT.isTokenValid(token)) {
        responseError(response, "JWT is not valid.");
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

  private async update(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const body: UpdateDTO = request.body;
      const token = request.headers.authorization.split(" ")[1];

      const id = JWT.getJwtPayloadValueByKey(token, "id");

      const userToUpdate = await this.userRepository.findOne({
        where: { id },
      });

      if (!userToUpdate) {
        responseError(response, "User does not exist.");
      }

      const userUpdate = { ...userToUpdate, ...body };
      await this.userRepository.save(userUpdate);

      const user: UserDTO = userUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { ...user, password: undefined },
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

  private async partialUpdate(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const body: UpdateDTO = request.body;
      const token = request.headers.authorization.split(" ")[1];

      const fieldToUpdate: string = Object.keys(body)[0];
      const id = JWT.getJwtPayloadValueByKey(token, "id");

      const userToUpdate = await this.userRepository.findOne({
        where: { id },
      });

      if (!userToUpdate) {
        responseError(response, "User does not exist.");
      }

      const userUpdate = {
        ...userToUpdate,
        [fieldToUpdate]: body[fieldToUpdate],
      };
      await this.userRepository.save(userUpdate);

      const user: UserDTO = userUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { ...user, password: undefined },
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

  async userMe(request: Request, response: Response, next: NextFunction) {
    if (request.method == "GET") {
      return this.retrieve(request, response, next);
    } else if (request.method == "PUT") {
      return this.update(request, response, next);
    } else if (request.method == "PATCH") {
      return this.partialUpdate(request, response, next);
    } else if (request.method == "DELETE") {
      return this.delete(request, response, next);
    }
  }
}
