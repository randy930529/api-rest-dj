import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
  Not,
  OneToMany,
} from "typeorm";
import Model from "./Base";
import { HiredPerson } from "./HiredPerson";
import { Profile } from "./Profile";
import { ColumnNumericTransformer } from "../utils/ColumnNumericTransformer";
import * as moment from "moment";
import { ProfileHiredPersonActivity } from "./ProfileHiredPersonActivity";

@Entity()
export class ProfileHiredPerson extends Model {
  @Column()
  date_start: Date;

  @Column()
  date_end: Date;

  @Column({
    type: "numeric",
    precision: 19,
    scale: 4,
    transformer: new ColumnNumericTransformer(),
  })
  import: number;

  @ManyToOne(() => Profile, { onDelete: "CASCADE" })
  @JoinColumn()
  profile: Profile;

  @Column({ nullable: true })
  __profileId__: number;

  @ManyToOne(() => HiredPerson, { onDelete: "CASCADE" })
  @JoinColumn()
  hiredPerson: HiredPerson;

  @OneToMany(
    () => ProfileHiredPersonActivity,
    (profileHiredPersonActivity) =>
      profileHiredPersonActivity.profileHiredPerson,
    {
      cascade: true,
    }
  )
  profileHiredPersonActivity: ProfileHiredPersonActivity[];

  toJSON() {
    return {
      ...this,
      __profileId__: undefined,
    };
  }

  @BeforeInsert()
  @BeforeUpdate()
  async checkDuplicateHired(): Promise<void> {
    if (this.profile) {
      this.__profileId__ = this.profile.id;
    }

    if (this.hiredPerson) {
      const checkDuplicateHired = await ProfileHiredPerson.findOne({
        where: {
          profile: { id: this.__profileId__ },
          id: this.id && Not(this.id),
          hiredPerson: { id: this.hiredPerson?.id },
        },
      });

      const isDateOverlap =
        checkDuplicateHired &&
        moment(checkDuplicateHired.date_start).isBefore(
          moment(this.date_end)
        ) &&
        moment(checkDuplicateHired.date_end).isAfter(moment(this.date_start));

      if (isDateOverlap) {
        throw new Error(
          "Es posible que esta persona es contratada para esta fecha."
        );
      }
    }
  }
}
