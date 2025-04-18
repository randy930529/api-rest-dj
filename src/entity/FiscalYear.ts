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
  Not,
} from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";
import * as moment from "moment";
import { Dj08SectionData, SectionName } from "./Dj08SectionData";
import { MusicalGroup } from "./MusicalGroup";
import { SupportDocument } from "./SupportDocument";
import { DJ08 } from "./DJ08";
import { FiscalYearEnterprise } from "./FiscalYearEnterprise";
import { ProfileActivity } from "./ProfileActivity";
import { ProfileHiredPerson } from "./ProfileHiredPerson";
import { SectionState } from "./SectionState";
import { Voucher } from "./Voucher";
import { VoucherDetail } from "./VoucherDetail";

@Entity()
export class FiscalYear extends Model {
  @Column({ type: "integer", width: 4 })
  year: number;

  @Column({ default: moment().startOf("year") })
  date: Date;

  @Column({ default: true })
  general_scheme: boolean;

  @Column({ nullable: true })
  __profileId__: number;

  @Column({ default: false })
  declared: boolean;

  @Column({ default: true })
  individual: boolean;

  @Column({ default: false })
  regimen: boolean;

  @Column({ default: true })
  is_tcp: boolean;

  @Column({ default: false })
  run_acounting: boolean;

  @Column({ default: true })
  balanced: boolean;

  @Column({ default: false })
  has_documents: boolean;

  @ManyToOne(() => Profile, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn()
  profile: Profile;

  @OneToOne(() => MusicalGroup, (musicalGroup) => musicalGroup.fiscalYear, {
    cascade: true,
  })
  @JoinColumn()
  musicalGroup: MusicalGroup;

  @Column({ default: false })
  primary: boolean;

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
  profileActivities: ProfileActivity[];

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
  async checksBeforeInsertAndUpdateFiscalYear(): Promise<void> {
    await Promise.all([
      this.checkDuplicateFiscalYearForProfile(),
      this.checkFiscalYearIncomesPrevious(),
    ]);
  }

  private async checkDuplicateFiscalYearForProfile(): Promise<void> {
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

  private async checkFiscalYearIncomesPrevious(): Promise<void> {
    const lastFiscalYearIdInProfile = await FiscalYear.findOne({
      where: {
        id: Not(this.id),
        profile: { id: this.__profileId__ },
        year: this.year - 1,
      },
      order: { id: "DESC" },
    });

    const totalIncomesSectionA = await this.getTotalIncomesInLastFiscalYear(
      lastFiscalYearIdInProfile?.id
    );
    if (totalIncomesSectionA > 500000) this.run_acounting = true;

    if (!this.run_acounting && this.id && this.id !== -1) {
      const voucherInFiscalYear = await Voucher.findOneBy({
        supportDocument: { __fiscalYearId__: this.id },
      });
      this.run_acounting = !!voucherInFiscalYear;
    }
  }

  @BeforeRemove()
  async checksBeforeRemoveFiscalYear(): Promise<void> {
    await Promise.all([
      this.checkIfRemoveTheLastFiscalYear(),
      this.checkNotRemoveSectionFiscalYear(),
      this.removeInitBalances(),
      this.checkHasDocuments(),
    ]);
  }

  private async checkIfRemoveTheLastFiscalYear(): Promise<void> {
    const countFiscalYear = await FiscalYear.count({
      where: { profile: { id: this.profile?.id } },
    });

    if (countFiscalYear < 2) {
      throw new Error(
        "No es admitido eliminar el útmo año fiscal del perfil actual."
      );
    }
  }

  private async checkNotRemoveSectionFiscalYear(): Promise<void> {
    const sectionFiscalYear = await SectionState.findOne({
      where: { fiscalYear: { id: this.id } },
    });

    if (sectionFiscalYear) {
      throw new Error(
        "No es admitido eliminar el año fiscal activo en la sección, antes cambie de año fiscal."
      );
    }
  }

  private async checkHasDocuments(): Promise<void> {
    if (this.has_documents) {
      throw new Error(
        "No se puede eliminar porque tiene documentos asociados."
      );
    }
  }

  private async removeInitBalances() {
    if (!this.has_documents) {
      const initBalances = await VoucherDetail.findBy({
        mayor: { fiscalYear: { id: this.id } },
      });

      await VoucherDetail.remove(initBalances);
    } else {
      throw new Error(
        "No se puede eliminar porque tiene documentos asociados."
      );
    }
  }

  private async getTotalIncomesInLastFiscalYear(
    fiscalYearId: number
  ): Promise<number> {
    if (!fiscalYearId) return 0;

    const dj08SectionData = await Dj08SectionData.findOneBy({
      dJ08: { fiscalYear: { id: fiscalYearId } },
      is_rectification: true,
    });

    if (!dj08SectionData) return 0;

    const section_data = JSON.parse(dj08SectionData.section_data);
    return section_data[SectionName.SECTION_A]?.totals?.incomes || 0;
  }
}
