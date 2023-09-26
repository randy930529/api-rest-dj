import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { User } from "../../entity/User";
import { useResponseError } from "../hooks/useResponseError";
import { RegistryDTO } from "../dto/response/auth/registry.dto";

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

      let userToRemove = await this.userRepository.findOneBy({ id });

      if (!userToRemove) {
        useResponseError(response, "This user does not exist.", 400);
      }

      await this.userRepository.remove(userToRemove);

      response.status(204);
      return "User has been removed.";
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
