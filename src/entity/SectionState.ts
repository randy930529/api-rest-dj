import { Entity, JoinColumn, OneToOne } from "typeorm";
import Model from "./Base";
import { User } from "./User";
import { Profile } from "./Profile";
import { FiscalYear } from "./FiscalYear";
import { LicenseUser } from "./LicenseUser";

@Entity()
export class SectionState extends Model {
  @OneToOne(() => User, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  user: User;

  @OneToOne(() => LicenseUser)
  @JoinColumn()
  licenseUser: LicenseUser;

  @OneToOne(() => Profile)
  @JoinColumn()
  profile: Profile;

  @OneToOne(() => FiscalYear)
  @JoinColumn()
  fiscalYear: FiscalYear;
}
