import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  BeforeRemove,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
} from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";
import * as moment from "moment";
import { Dj08SectionData } from "./Dj08SectionData";
import { MusicalGroup } from "./MusicalGroup";

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

  @Column({ default: false })
  declared: boolean;

  @Column({ default: false })
  individual: boolean;

  @Column({ default: false })
  regimen: boolean;

  @OneToOne(() => MusicalGroup, (musicalGroup) => musicalGroup.fiscalYear, {
    cascade: true,
  })
  @JoinColumn()
  musicalGroup: MusicalGroup;

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

    if (this.individual && !this.musicalGroup) {
      throw new Error(
        "Fiscal year marked as individual must have a musical group associated."
      );
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
