import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import Model from "./Base";
import { User } from "./User";
import { ProfileHiredPerson } from "./ProfileHiredPerson";
import { HiredPerson } from "./HiredPerson";
import { FiscalYear } from "./FiscalYear";

@Entity()
@Unique(["nit"])
export class Profile extends Model {
  @Column({ default: "" })
  nombre: string;

  @Column({ default: "" })
  last_name: string;

  @Column({ type: "varchar", length: 11, default: "" })
  ci: string;

  @Column({
    type: "varchar",
    length: 20,
    unique: true,
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

  @BeforeInsert()
  @BeforeUpdate()
  async checkDuplicateProfiles(): Promise<void> {
    const profilesWithSameCi = await Profile.count({ where: { ci: this.ci } });

    if (profilesWithSameCi >= 2) {
      throw new Error("Only two profiles with the same CI are allowed.");
    }
  }
}
