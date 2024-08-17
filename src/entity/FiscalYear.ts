import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  BeforeRemove,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
  OneToMany,
} from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";
import * as moment from "moment";
import { Dj08SectionData } from "./Dj08SectionData";
import { MusicalGroup } from "./MusicalGroup";
import { SupportDocument } from "./SupportDocument";
import { DJ08 } from "./DJ08";
import { FiscalYearEnterprise } from "./FiscalYearEnterprise";
import { ProfileActivity } from "./ProfileActivity";
import { ProfileHiredPerson } from "./ProfileHiredPerson";

@Entity()
export class FiscalYear extends Model {
  @Column({ type: "integer", width: 4 })
  year: number;

  @Column({ default: moment().startOf("year") })
  date: Date;

  @Column({ default: true })
  general_scheme: boolean;

  @ManyToOne(() => Profile, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn()
  profile: Profile;

  @Column({ nullable: true })
  __profileId__: number;

  @Column({ default: false })
  declared: boolean;

  @Column({ default: true })
  individual: boolean;

  @Column({ default: false })
  regimen: boolean;

  @OneToOne(() => MusicalGroup, (musicalGroup) => musicalGroup.fiscalYear, {
    cascade: true,
  })
  @JoinColumn()
  musicalGroup: MusicalGroup;

  @OneToMany(
    () => SupportDocument,
    (supportDocument) => supportDocument.fiscalYear,
    { cascade: ["remove"] }
  )
  supportDocuments: SupportDocument[];

  @OneToMany(() => DJ08, (dj08) => dj08.fiscalYear)
  dj08: DJ08[];

  @OneToMany(
    () => FiscalYearEnterprise,
    (fiscalYearEnterprise) => fiscalYearEnterprise.fiscalYear,
    { cascade: ["remove"] }
  )
  fiscalYearEnterprise: FiscalYearEnterprise[];

  @OneToMany(
    () => ProfileHiredPerson,
    (profileHiredPerson) => profileHiredPerson.fiscalYear,
    { cascade: ["remove"] }
  )
  profileHiredPerson: ProfileHiredPerson[];

  @OneToMany(
    () => ProfileActivity,
    (profileActivity) => profileActivity.fiscalYear,
    { cascade: ["remove"] }
  )
  profileActivitis: ProfileActivity[];

  @Column({ default: true })
  is_tcp: boolean;

  toJSON() {
    return {
      ...this,
      __profileId__: undefined,
      supportDocuments: undefined,
      dj08: undefined,
    };
  }

  @BeforeInsert()
  @BeforeUpdate()
  async checkDuplicateFiscalYearForProfile(): Promise<void> {
    if (this.profile) {
      this.__profileId__ = this.profile.id;
    }

    if (!this.individual && !this.musicalGroup) {
      throw new Error(
        "El año fiscal marcado como no individual debe tener un grupo musical asociado."
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

    if (duplicateFiscalYear && this.id !== duplicateFiscalYear?.id) {
      throw new Error("Sólo un año fiscal con misma fecha y año es admitido.");
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
