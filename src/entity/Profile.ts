import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import Model from "./Base";
import { User } from "./User";
import { ProfileHiredPerson } from "./ProfileHiredPerson";
import { HiredPerson } from "./HiredPerson";
import { FiscalYear } from "./FiscalYear";
import { ProfileEnterprise } from "./ProfileEnterprise";
import { ProfileActivity } from "./ProfileActivity";

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

  @Column({ nullable: true })
  address: string;

  @Column({ default: false })
  primary: boolean;

  @ManyToOne(() => User, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  user: User;

  @OneToMany(
    () => ProfileHiredPerson,
    (profileHiredPerson) => profileHiredPerson.profile
  )
  profileHiredPerson: ProfileHiredPerson[];

  @OneToMany(() => HiredPerson, (hiredPerson) => hiredPerson.profile)
  hiredPerson: HiredPerson[];

  @OneToMany(() => FiscalYear, (fiscalYear) => fiscalYear.profile)
  fiscalYear: FiscalYear[];

  @OneToMany(
    () => ProfileEnterprise,
    (profileEnterprise) => profileEnterprise.profile
  )
  profileEnterprise: ProfileEnterprise[];

  @OneToMany(
    () => ProfileActivity,
    (profileActivity) => profileActivity.profile
  )
  profileActivity: ProfileActivity[];

  @BeforeInsert()
  @BeforeUpdate()
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
