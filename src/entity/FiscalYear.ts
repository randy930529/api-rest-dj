import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  BeforeRemove,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";
import * as moment from "moment";
import { Dj08SectionData } from "./Dj08SectionData";

@Entity()
export class FiscalYear extends Model {
  @Column({ type: "integer", width: 4 })
  year: number;

  @Column({ default: moment().startOf("year") })
  date: Date;

  @Column({ default: true })
  general_scheme: boolean;

  @ManyToOne(() => Profile)
  @JoinColumn()
  profile: Profile;

  @Column({ nullable: true })
  __profileId__: number;

  toJSON() {
    return {
      ...this,
      __profileId__: undefined,
    };
  }

  @BeforeInsert()
  @BeforeUpdate()
  async checkDuplicateFiscalYearForProfile(): Promise<void> {
    if (this.profile) {
      this.__profileId__ = this.profile.id;
    }

    const { year, __profileId__: profileId } = this;
    const month = this.date ? moment(this.date).month() + 1 : 1;
    const duplicateFiscalYear = await FiscalYear.createQueryBuilder(
      `fiscalYear`
    )
      .select([`fiscalYear.id`])
      .leftJoin(`fiscalYear.profile`, `profile`)
      .where(`profile.id= :profileId`, {
        profileId,
      })
      .andWhere(`fiscalYear.year= :year`, { year })
      .andWhere(`EXTRACT(month FROM fiscalYear.date)= :month`, {
        month,
      })
      .getOne();

    if (duplicateFiscalYear && this.id != duplicateFiscalYear?.id) {
      throw new Error("Only a fiscal year with same date and year is allowed.");
    }
  }

  @BeforeRemove()
  async removeDJ08(): Promise<void> {
    const dj08ToRemove = await Dj08SectionData.findOne({
      relations: ["dJ08"],
      where: {
        dJ08: { fiscalYear: { id: this.id } },
      },
    });

    if (dj08ToRemove) {
      await dj08ToRemove.remove();
      await dj08ToRemove.dJ08.remove();
    }
  }
}
