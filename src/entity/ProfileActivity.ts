import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";
import { Activity } from "./Activity";
import { SupportDocument } from "./SupportDocument";
import { ProfileHiredPersonActivity } from "./ProfileHiredPersonActivity";
import { FiscalYear } from "./FiscalYear";

@Entity()
export class ProfileActivity extends Model {
  @Column()
  date_start: Date;

  @Column()
  date_end: Date;

  @ManyToOne(() => Profile, { onDelete: "CASCADE" })
  @JoinColumn()
  profile: Profile;

  @Column({ nullable: true })
  __profileId__: number;

  @ManyToOne(() => Activity)
  @JoinColumn()
  activity: Activity;

  @OneToMany(
    () => SupportDocument,
    (supportDocument) => supportDocument.profileActivity
  )
  supportDocuments: SupportDocument[];

  @OneToMany(
    () => ProfileHiredPersonActivity,
    (profileHiredPersonActivity) => profileHiredPersonActivity.profileActivity
  )
  profileHiredPersonActivity: ProfileHiredPersonActivity[];

  @Column({ default: false })
  primary: boolean;

  @ManyToOne(() => FiscalYear, { onDelete: "CASCADE" })
  @JoinColumn()
  fiscalYear: FiscalYear;

  @Column({ nullable: true })
  __fiscalYearId__: number;

  toJSON() {
    return {
      ...this,
      __profileId__: undefined,
      __fiscalYearId__: undefined,
    };
  }

  @BeforeInsert()
  @BeforeUpdate()
  async checkDuplicateProfileActivity(): Promise<void> {
    if (this.profile) {
      this.__profileId__ = this.profile.id;
    }
    if (this.fiscalYear) {
      this.__fiscalYearId__ = this.fiscalYear.id;
    }

    if (this.activity) {
      const activityWithSameName = await ProfileActivity.findOne({
        where: {
          fiscalYear: { id: this.fiscalYear?.id },
          activity: { id: this.activity?.id },
        },
      });

      if (activityWithSameName && this.id !== activityWithSameName?.id) {
        throw new Error("Sólo una actividad con el mismo nombre es admitida.");
      }
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  async checkDuplicateProfileActivityPrimary(): Promise<void> {
    if (this.activity && this.primary) {
      const activityPrimary = await ProfileActivity.findOne({
        where: {
          profile: { id: this.profile?.id },
          fiscalYear: { id: this.fiscalYear?.id },
          primary: true,
        },
      });

      if (activityPrimary && this.id !== activityPrimary?.id) {
        throw new Error("Sólo una actividad principal es admitida.");
      }
    }
  }
}
