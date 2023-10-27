import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { User } from "../../entity/User";
import { responseError } from "../../errors/responseError";
import { RegistryDTO } from "../dto/response/auth/registry.dto";
import { JWT } from "../security/jwt";
import { UserDTO } from "../dto/response/auth/user.dto";
import { BaseResponseDTO } from "../dto/response/base.dto";
import { UpdateDTO } from "../dto/request/update.dto";
import { UserWhitProfileDTO } from "../dto/response/auth/userWhitProfile.dto";

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  async all(req: Request, res: Response, next: NextFunction) {
    return this.userRepository.find({
      relations: {
        profiles: true,
      },
    });
  }

  async one(req: Request, res: Response, next: NextFunction) {
    const id = parseInt(req.params.id);

    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      return "Unregistered user.";
    }
    return user;
  }

  async save(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    const user = Object.assign(new User(), {
      email,
      password,
    });

    return this.userRepository.save(user);
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      await this.destroy(res, id);

      res.status(204);
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

  private async retrieve(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization.split(" ")[1];

      if (!JWT.isTokenValid(token)) {
        responseError(res, "JWT is not valid.");
      }

      const id = JWT.getJwtPayloadValueByKey(token, "id");
      const user = await this.userRepository.findOne({
        relations: {
          profiles: true,
          licenseUser: true,
        },
        where: { id },
      });

      if (!user) {
        responseError(res, "User does not exist.");
      }

      const userDTO: UserWhitProfileDTO = user.toJSON();
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: {
          user: userDTO,
        },
      };

      res.status(200);
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

  private async destroy(res: Response, userId: number) {
    const id = userId;

    if (!id) responseError(res, "Destroy user requiere user id valid.", 400);

    let userToRemove = await this.userRepository.findOneBy({ id });

    if (!userToRemove) responseError(res, "This user does not exist.", 400);

    await this.userRepository.remove(userToRemove);
  }

  private async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization.split(" ")[1];

      if (!JWT.isTokenValid(token)) {
        responseError(res, "JWT is not valid.");
      }

      const id = JWT.getJwtPayloadValueByKey(token, "id");

      await this.destroy(res, id);

      res.status(204);
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

  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const body: UpdateDTO = req.body;
      const token = req.headers.authorization.split(" ")[1];

      const id = JWT.getJwtPayloadValueByKey(token, "id");

      const userToUpdate = await this.userRepository.findOneBy({ id });

      if (!userToUpdate) {
        responseError(res, "User does not exist.");
      }

      const userUpdate = { ...userToUpdate, ...body };
      await this.userRepository.save(userUpdate);

      const user: UserDTO = userUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { ...user, password: undefined },
      };

      res.status(200);
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

  private async partialUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const body: UpdateDTO = req.body;
      const token = req.headers.authorization.split(" ")[1];

      const fieldToUpdate: string = Object.keys(body)[0];
      const id = JWT.getJwtPayloadValueByKey(token, "id");

      const userToUpdate = await this.userRepository.findOneBy({ id });

      if (!userToUpdate) {
        responseError(res, "User does not exist.");
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

      res.status(200);
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

  async userMe(req: Request, res: Response, next: NextFunction) {
    if (req.method == "GET") {
      return this.retrieve(req, res, next);
    } else if (req.method == "PUT") {
      return this.update(req, res, next);
    } else if (req.method == "PATCH") {
      return this.partialUpdate(req, res, next);
    } else if (req.method == "DELETE") {
      return this.delete(req, res, next);
    }
  }
}
