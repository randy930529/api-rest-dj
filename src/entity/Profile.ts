import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
  BeforeInsert,
} from "typeorm";
import Model from "./Base";
import { User } from "./User";
import { ProfileHiredPerson } from "./ProfileHiredPerson";
import { HiredPerson } from "./HiredPerson";
import { FiscalYear } from "./FiscalYear";
import { ProfileEnterprise } from "./ProfileEnterprise";
import { ProfileActivity } from "./ProfileActivity";
import { ProfileAddress } from "./ProfileAddress";

@Entity()
export class Profile extends Model {
  @Column({ default: "" })
  first_name: string;

  @Column({ default: "" })
  last_name: string;

  @Column({ type: "varchar", length: 11, default: "" })
  ci: string;

  @Column({
    type: "varchar",
    length: 20,
    nullable: true,
    default: "",
  })
  nit: string;

  @ManyToOne(() => ProfileAddress, { nullable: true, cascade: true })
  @JoinColumn()
  address: ProfileAddress;

  @Column({ default: false })
  primary: boolean;

  @Column({ type: "varchar", length: 50, nullable: true })
  run_in_municipality: string;

  @ManyToOne(() => User, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  user: User;

  @OneToMany(
    () => ProfileHiredPerson,
    (profileHiredPerson) => profileHiredPerson.profile,
    { cascade: ["remove"] }
  )
  profileHiredPerson: ProfileHiredPerson[];

  @OneToMany(() => HiredPerson, (hiredPerson) => hiredPerson.profile, {
    cascade: ["remove"],
  })
  hiredPerson: HiredPerson[];

  @OneToMany(() => FiscalYear, (fiscalYear) => fiscalYear.profile, {
    cascade: true,
  })
  fiscalYear: FiscalYear[];

  @OneToMany(
    () => ProfileEnterprise,
    (profileEnterprise) => profileEnterprise.profile,
    { cascade: ["remove"] }
  )
  profileEnterprise: ProfileEnterprise[];

  @OneToMany(
    () => ProfileActivity,
    (profileActivity) => profileActivity.profile,
    { cascade: ["remove"] }
  )
  profileActivity: ProfileActivity[];

  @BeforeInsert()
  async checkDuplicateProfilesForUser(): Promise<void> {
    const profilesForUserWithSameCi = await Profile.count({
      where: [
        { user: { id: this.user.id }, ci: this.ci },
        { user: { id: this.user.id }, nit: this.nit },
      ],
    });

    if (profilesForUserWithSameCi >= 2) {
      throw new Error("Only two profiles with the same CI are allowed.");
    }
  }
}
