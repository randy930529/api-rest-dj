import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { Profile } from "../../entity/Profile";
import { ProfileDTO } from "../dto/request/profile.dto";

export class ProfileController {
  private profileRepository = AppDataSource.getRepository(Profile);

  async create(request: Request, response: Response, next: NextFunction) {
    const body: ProfileDTO = request.body;

    const profile = Object.assign(new Profile(), {
      ...body,
    });

    return this.profileRepository.save(profile);
  }

  async all(request: Request, response: Response, next: NextFunction) {
    return this.profileRepository.find();
  }

  async on(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);

    return this.profileRepository.findOne({
      where: { id },
    });
  }

  async update(request: Request, response: Response, next: NextFunction) {
    const body: ProfileDTO = request.body;
    const id = body.id;

    const profileToUpdate = await this.profileRepository.findOne({
      where: { id },
    });

    const profileUpdate = { ...profileToUpdate, ...body };
    await this.profileRepository.save(profileUpdate);
  }

  async delete(request: Request, response: Response, next: NextFunction) {
    const { id } = request.body;

    const profileToRemove = await this.profileRepository.findOneBy({ id });
    await this.profileRepository.remove(profileToRemove);
  }
}
