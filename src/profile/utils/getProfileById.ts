import { Response } from "express";
import { AppDataSource } from "../../data-source";
import { Profile } from "../../entity/Profile";
import { responseError } from "../../errors/responseError";

const profileRepository = AppDataSource.getRepository(Profile);

const getProfileById = async ({
  id,
  res,
}: {
  id: number;
  res: Response;
}): Promise<Profile> => {
  if (!id) responseError(res, "Do must provide a valid profile id.", 404);

  const profile = await profileRepository.findOneBy({ id });

  if (!profile) responseError(res, "Profile not found.", 404);

  return profile;
};

export default getProfileById;
