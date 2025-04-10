import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  BeforeRemove,
} from "typeorm";
import Model from "./Base";
import { User } from "./User";
import { HiredPerson } from "./HiredPerson";
import { FiscalYear } from "./FiscalYear";
import { ProfileActivity } from "./ProfileActivity";
import { ProfileAddress } from "./ProfileAddress";
import { SectionState } from "./SectionState";

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

  @ManyToOne(() => ProfileAddress, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    cascade: ["insert", "update"],
  })
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

  @OneToMany(() => HiredPerson, (hiredPerson) => hiredPerson.profile, {
    cascade: ["remove"],
  })
  hiredPerson: HiredPerson[];

  @OneToMany(() => FiscalYear, (fiscalYear) => fiscalYear.profile, {
    cascade: true,
  })
  fiscalYear: FiscalYear[];

  @OneToMany(
    () => ProfileActivity,
    (profileActivity) => profileActivity.profile,
    { cascade: ["remove"] }
  )
  profileActivity: ProfileActivity[];

  @Column({ default: "" })
  profile_email: string;

  @Column({ nullable: true })
  currentfiscalYear: Number;

  @BeforeInsert()
  @BeforeUpdate()
  async checkDuplicateProfilesForUser(): Promise<void> {
    const profilesForUserWithSameCi = await Profile.count({
      where: [
        { user: { id: this.user?.id }, ci: this.ci },
        { user: { id: this.user?.id }, nit: this.nit },
      ],
    });

    if (profilesForUserWithSameCi >= 2) {
      throw new Error("Sólo dos perfiles con igual CI son admitidos.");
    }
  }

  @BeforeRemove()
  async checkNotRemovePrimaryProfile(): Promise<void> {
    if (this.primary === true) {
      throw new Error("No es admitido eliminar el perfil primario.");
    }
  }

  @BeforeRemove()
  async checkNotRemoveSectionProfile(): Promise<void> {
    const sectionProfile = await SectionState.findOne({
      where: { profile: { id: this.id } },
    });

    if (sectionProfile) {
      throw new Error(
        "No es admitido eliminar el perfil activo en la sección, antes cambie de perfil."
      );
    }
  }
}
