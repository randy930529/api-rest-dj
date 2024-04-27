import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { User } from "../../entity/User";
import { responseError } from "../../errors/responseError";
import { JWT } from "../security/jwt";
import { UserDTO } from "../dto/response/auth/user.dto";
import { BaseResponseDTO } from "../dto/response/base.dto";
import { UserWhitProfileDTO } from "../dto/response/auth/userWhitProfile.dto";
import { UserUpdateDTO } from "../dto/request/userUpdate.dto";

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
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  private async retrieve(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;

      const id = JWT.getJwtPayloadValueByKey(token, "id");
      const user = await this.userRepository.findOne({
        relations: {
          profiles: {address: {address: true}},
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
      if (res.statusCode === 200) res.status(500);
      next(error);
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
      const { token } = req.body;

      const id = JWT.getJwtPayloadValueByKey(token, "id");

      await this.destroy(res, id);

      res.status(204);
      return "User has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: UserUpdateDTO = req.body;
      const { user: userToUpdate }: { user: User } = req.body;

      const userUpdate = { ...userToUpdate, ...fields };
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
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  private async partialUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: UserUpdateDTO = req.body;
      const { user: userToUpdate }: { user: User } = req.body;

      const fieldToUpdate: string = Object.keys(fields)[0];

      const userUpdate = {
        ...userToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
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
      if (res.statusCode === 200) res.status(500);
      next(error);
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
