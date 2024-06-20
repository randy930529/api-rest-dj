import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import * as moment from "moment";
import { Profile } from "../../entity/Profile";
import { ProfileDTO } from "../dto/request/profile.dto";
import { responseError } from "../../errors/responseError";
import { User } from "../../entity/User";
import { JWT } from "../../auth/security/jwt";
import { BaseResponseDTO } from "../../auth/dto/response/base.dto";
import { CreateProfileDTO } from "../dto/response/createProfile.dto";
import { EntityControllerBase } from "../../base/EntityControllerBase";
import { FiscalYear } from "../../entity/FiscalYear";
import { ProfileAddress } from "../../entity/ProfileAddress";
import { UpdateProfileAddressDTO } from "../dto/request/updateProfileAddress.dto";
import { Address } from "../../entity/Address";

export class ProfileController extends EntityControllerBase<Profile> {
  constructor() {
    const repository = AppDataSource.getRepository(Profile);
    super(repository);
  }

  async createProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: ProfileDTO = req.body;
      const { user }: { user: User } = req.body;

      if (!user.active) {
        responseError(res, "User not activate.", 401);
      }

      const countProfiles: number = await Profile.countBy({
        user: { id: user.id },
      });

      if (countProfiles >= user.max_profiles) {
        responseError(
          res,
          "This user excede the max profiles to current licese.",
          400
        );
      }

      let { residence } = fields.address.address;
      residence =
        residence ||
        `Call. ${fields.address.street || ""} #${
          fields.address.number || ""
        }, Apto. ${fields.address.apartment || ""}, %${
          fields.address.betweenStreets || ""
        }, ${fields.address.ref || ""}`;

      const addressDTO = Address.create({
        ...fields.address.address,
        residence,
      });
      const address = await addressDTO.save();
      const profileAddressDTO = ProfileAddress.create({
        ...fields.address,
        address,
      });
      const profileAddress = await profileAddressDTO.save();

      const newProfileDTO = this.repository.create({
        ...fields,
        user,
        address: profileAddress,
      });
      const newProfile = await this.repository.save(newProfileDTO);

      const date = moment().startOf("year").toDate();
      const year = moment().year();

      const newFiscalYear = FiscalYear.create({
        year,
        date,
        profile: newProfile,
      });
      await FiscalYear.save(newFiscalYear);

      const profile: CreateProfileDTO = newProfileDTO;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profile },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async onProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      return await this.one({ id, req, res });
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: ProfileDTO = req.body;
      const { id, token } = req.body;
      const userId = JWT.getJwtPayloadValueByKey(token, "id");

      if (!id)
        responseError(res, "Update profile requiere profile id valid.", 404);

      const profileToUpdate = await this.repository.findOne({
        relations: {
          user: true,
          address: { address: true },
        },
        where: { id },
      });

      if (profileToUpdate.user.id !== userId)
        responseError(
          res,
          "User is not authorized to update this profile.",
          401
        );

      if (
        (fields.ci && fields.ci != profileToUpdate.ci) ||
        (fields.nit && fields.nit != profileToUpdate.nit)
      ) {
        const profilesForUserWithSameCi = await this.repository.count({
          where: [
            { user: { id: userId }, ci: fields.ci },
            { user: { id: userId }, nit: fields.nit },
          ],
        });

        if (profilesForUserWithSameCi >= 2) {
          responseError(
            res,
            "Only two profiles with the same CI are allowed.",
            401
          );
        }
      }

      const fieldsToProfileUpdate = this.repository.create({
        ...profileToUpdate,
        ...fields,
      });
      const profileUpdate = await this.repository.save(fieldsToProfileUpdate);

      const profile: ProfileDTO = profileUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profile },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async partialUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      let fields: ProfileDTO = req.body;
      const { id, token } = req.body;
      const userId = JWT.getJwtPayloadValueByKey(token, "id");

      if (!id)
        responseError(res, "Update profile requiere profile id valid.", 401);

      const fieldToUpdate: string = Object.keys(fields)[1];

      const profileToUpdate = await this.repository.findOne({
        relations: {
          user: true,
          address: { address: true },
        },
        where: { id },
      });

      if (!profileToUpdate) {
        responseError(res, "Profile does not exist.", 404);
      }

      if (profileToUpdate.user.id !== userId)
        responseError(
          res,
          "User is not authorized to update this profile.",
          401
        );

      if (
        (fieldToUpdate === "ci" && fields.ci != profileToUpdate.ci) ||
        (fieldToUpdate === "nit" && fields.nit != profileToUpdate.nit)
      ) {
        const profilesForUserWithSameCi = await this.repository.count({
          where: {
            user: { id: userId },
            [fieldToUpdate]: fields[fieldToUpdate],
          },
        });

        if (profilesForUserWithSameCi >= 2) {
          responseError(
            res,
            "Only two profiles with the same CI are allowed.",
            401
          );
        }
      }

      const fieldToProfileUpdate = {
        ...profileToUpdate,
        [fieldToUpdate]: fields[fieldToUpdate],
      };
      const profileUpdate = await this.repository.save(fieldToProfileUpdate);

      const profile: ProfileDTO = profileUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profile },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      let fields: UpdateProfileAddressDTO = req.body;
      const { id, token } = req.body;
      const userId = JWT.getJwtPayloadValueByKey(token, "id");

      if (!id)
        responseError(res, "Update profile requiere profile id valid.", 404);

      let profileToUpdate = await this.repository.findOne({
        relations: {
          user: true,
          address: { address: true },
        },
        where: { id },
      });

      if (profileToUpdate.user.id !== userId)
        responseError(
          res,
          "User is not authorized to update this profile.",
          401
        );

      let { address: profileAddress } = profileToUpdate;

      if (!profileAddress) {
        const { street, number, apartment, betweenStreets, ref } =
          fields.address;
        const residence = `Call. ${street || ","} #${number || ""}, Apto. ${
          apartment || ""
        }, %${betweenStreets || ""}, ${ref || ""}`;

        const addressDTO = Address.create({
          ...fields.address.address,
          residence,
        });
        const addressUpdate = await addressDTO.save();

        const profileAddressDTO = ProfileAddress.create({
          ...fields.address,
          address: addressUpdate,
        });
        profileAddress = await profileAddressDTO.save();
        profileToUpdate.address = profileAddress;
        profileToUpdate = await profileToUpdate.save();
      } else {
        if (fields.address.address && profileAddress.address) {
          let { address } = profileAddress;
          address = Address.create({
            ...address,
            ...fields.address.address,
          });
          fields.address.address = address;
        }

        profileAddress = ProfileAddress.create({
          ...profileAddress,
          ...fields.address,
        });

        const profileAddressUpdate = await profileAddress.save();
        profileToUpdate.address = profileAddressUpdate;
      }

      const profile: ProfileDTO = profileToUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profile },
      };

      res.status(201);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async partialUpdateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      let fields: UpdateProfileAddressDTO = req.body;
      const { id, token } = req.body;
      const userId = JWT.getJwtPayloadValueByKey(token, "id");

      if (!id)
        responseError(res, "Update profile requiere profile id valid.", 401);

      const fieldToUpdate: string = Object.keys(fields.address)[0];

      let profileToUpdate = await this.repository.findOne({
        relations: {
          user: true,
          address: { address: true },
        },
        where: { id },
      });

      if (!profileToUpdate) {
        responseError(res, "Profile does not exist.", 404);
      }

      if (profileToUpdate.user.id !== userId)
        responseError(
          res,
          "User is not authorized to update this profile.",
          401
        );

      let { address: profileAddress } = profileToUpdate;

      if (!profileAddress) {
        const { street, number, apartment, betweenStreets, ref } =
          fields.address;
        const residence = `Call. ${street || ","} #${number || ""}, Apto. ${
          apartment || ""
        }, %${betweenStreets || ""}, ${ref || ""}`;

        const addressDTO = Address.create({
          ...fields.address.address,
          residence,
        });
        const addressUpdate = await addressDTO.save();

        const profileAddressDTO = ProfileAddress.create({
          ...fields.address,
          address: addressUpdate,
        });
        profileAddress = await profileAddressDTO.save();
        profileToUpdate.address = profileAddress;
        profileToUpdate = await profileToUpdate.save();
      }

      if (fieldToUpdate === "address") {
        const { address } = profileAddress;
        const fieldToAddressUpdate: string = Object.keys(
          fields.address.address
        )[0];

        address[fieldToAddressUpdate] =
          fields.address.address[fieldToAddressUpdate];

        const addressUpdate = await address.save();
        fields = {
          ...fields,
          address: { ...profileAddress, address: addressUpdate },
        };
      }

      profileAddress[fieldToUpdate] = fields.address[fieldToUpdate];

      const profileAddressUpdate = await profileAddress.save();
      profileToUpdate.address = profileAddressUpdate;

      const profile: ProfileDTO = profileToUpdate;
      const resp: BaseResponseDTO = {
        status: "success",
        error: undefined,
        data: { profile },
      };

      res.status(200);
      return { ...resp };
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async deleteProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);

      if (!id)
        responseError(res, "Delete profile requiere profile id valid.", 404);

      await this.delete({ id, res });

      res.status(204);
      return "Profile has been removed successfully.";
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}
