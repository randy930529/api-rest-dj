import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import Model from "./Base";
import { User } from "./User";
import { Profile } from "./Profile";
import { FiscalYear } from "./FiscalYear";
import { LicenseUser } from "./LicenseUser";
import { SectionName } from "./Dj08SectionData";

@Entity()
export class SectionState extends Model {
  @OneToOne(() => User, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  user: User;

  @OneToOne(() => LicenseUser)
  @JoinColumn()
  licenseUser: LicenseUser;

  @OneToOne(() => Profile)
  @JoinColumn()
  profile: Profile;

  @OneToOne(() => FiscalYear)
  @JoinColumn()
  fiscalYear: FiscalYear;

  @Column({ default: false })
  has_cultural_activity: boolean;

  toJSON() {
    const {
      has_cultural_activity,
      expenses_with_document,
      expenses_without_document,
      current_tax_debt,
    } = this.toSectionCalculateValues();

    return {
      ...this,
      created_at: undefined,
      updated_at: undefined,
      has_cultural_activity,
      expenses_without_document,
      expenses_with_document,
      current_tax_debt,
    };
  }

  /**
   * @description
   * Method to calculate:
   * @returns
   * 1. Find if the profile has cultural activity.
   * @returns
   * 2. The porcentage to expenses without document and expenses with document.
   * 3. The current tax debt for DJ-08.
   */
  private toSectionCalculateValues() {
    const find_cultural_activity = this.profile.profileActivity.find(
      (val) => val.activity.is_culture
    );
    const has_cultural_activity = !find_cultural_activity ? false : true;

    const countExpensesWithoutDocument =
      this.fiscalYear.supportDocuments.filter(
        (val) => val.type_document == "g" && !val.document
      ).length;

    const countExpensesPD =
      this.fiscalYear.supportDocuments.filter(
        (val) => val.type_document == "g" && val.element.group == "pd        "
      ).length || 1;

    const porcentage = parseFloat(
      ((countExpensesWithoutDocument / countExpensesPD) * 100).toFixed(2)
    );

    const section_data = JSON.parse(
      this.fiscalYear.dj08[0].dj08SectionData.find(
        (val) => val.is_rectification === true
      ).section_data
    );

    const { F26 } = section_data[SectionName.SECTION_C]["data"];
    let { F28, F29, F30, F31, F33a, F36a } =
      section_data[SectionName.SECTION_D]["data"];

    if (this.fiscalYear.declared) {
      F28 = (F26 || 0) - F33a;
      F29 = F36a;
      F30 = F28 > F29 ? F28 - F29 : 0;
      F31 = F28 > F29 ? 0 : F29 - F28;
    }
    const { F34, F35 } = section_data[SectionName.SECTION_E]["data"];
    const F32 = this.fiscalYear.declared ? F30 : F26;
    const F33 = (F32 * 5) / 100;

    const current_tax_debt = F32 - F33 - F34 || 0 + F35 || 0;

    const expenses_with_document = this.fiscalYear.supportDocuments.length
      ? 100 - porcentage
      : 0;

    return {
      expenses_without_document: porcentage,
      expenses_with_document,
      has_cultural_activity,
      current_tax_debt,
    };
  }
}
