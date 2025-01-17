import { FindOptionsRelations, FindOptionsSelect, Repository } from "typeorm";
import { User } from "../../../entity/User";

export const USER_SELECT: FindOptionsSelect<User> = {
  licenseUser: {
    id: true,
    tmBill: { id: true, stateTMBills: { id: true } },
  },
  profiles: {
    id: true,
    fiscalYear: {
      id: true,
      dj08: { id: true, dj08SectionData: true },
      supportDocuments: { id: true, element: { id: true } },
      profileHiredPerson: {
        id: true,
        profileHiredPersonActivity: { id: true },
      },
      fiscalYearEnterprise: { id: true },
    },
    address: { id: true, address: { id: true } },
    hiredPerson: { id: true },
    profileActivity: { id: true },
  },
};

export const USER_RELATIONS: FindOptionsRelations<User> = {
  licenseUser: { tmBill: { stateTMBills: true } },
  profiles: {
    fiscalYear: {
      dj08: { dj08SectionData: true },
      supportDocuments: { element: true },
      profileHiredPerson: { profileHiredPersonActivity: true },
      fiscalYearEnterprise: true,
    },
    address: { address: true },
    hiredPerson: true,
    profileActivity: true,
  },
};

export async function getUserToRemove(
  id: number,
  userRepository: Repository<User>
): Promise<User> {
  return await userRepository.findOne({
    select: USER_SELECT,
    relations: USER_RELATIONS,
    where: { id },
  });
}
