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
import * as moment from "moment";
import Model from "./Base";
import { HiredPerson } from "./HiredPerson";
import { ColumnNumericTransformer } from "../utils/ColumnNumericTransformer";
import { ProfileHiredPersonActivity } from "./ProfileHiredPersonActivity";
import { FiscalYear } from "./FiscalYear";

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

  @ManyToOne(() => FiscalYear, { onDelete: "CASCADE" })
  @JoinColumn()
  fiscalYear: FiscalYear;

  @Column({ nullable: true })
  __fiscalYearId__: number;

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
      __fiscalYearId__: undefined,
    };
  }

  @BeforeInsert()
  @BeforeUpdate()
  async checkDuplicateHired(): Promise<void> {
    if (this.fiscalYear) {
      this.__fiscalYearId__ = this.fiscalYear.id;
    }

    if (this.hiredPerson) {
      const checkDuplicateHired = await ProfileHiredPerson.findOne({
        where: {
          fiscalYear: { id: this.__fiscalYearId__ },
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
