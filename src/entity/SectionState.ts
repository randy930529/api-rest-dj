import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import * as moment from "moment";
import Model from "./Base";
import { User } from "./User";
import { Profile } from "./Profile";
import { FiscalYear } from "./FiscalYear";
import { LicenseUser } from "./LicenseUser";
import { SectionName } from "./Dj08SectionData";
import { appConfig } from "../../config";
import {
  calculateMora,
  calculeMoraDays,
} from "../reports/utils/utilsToReports";

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
    const { versionAPK, versionApp } = appConfig;
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
      versionAPK,
      versionApp,
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

    const expensesPDGT = this.fiscalYear?.supportDocuments.filter(
      (val) => val.type_document === "g" && val.element?.group?.startsWith("pd")
    );

    const { sumaTotalExpensesWithoutDocument, sumaTotalExpensesWithDocument } =
      expensesPDGT.reduce(
        (sumaTotal, val) => {
          if (!val.document) {
            sumaTotal.sumaTotalExpensesWithoutDocument += val.amount;
          } else {
            sumaTotal.sumaTotalExpensesWithDocument += val.amount;
          }
          return sumaTotal;
        },
        {
          sumaTotalExpensesWithoutDocument: 0,
          sumaTotalExpensesWithDocument: 0,
        }
      );

    const countExpensesPD =
      expensesPDGT.reduce((sumaTotal, val) => sumaTotal + val.amount, 0) || 1;

    const porcentageExpensesWithoutDocument = parseFloat(
      ((sumaTotalExpensesWithoutDocument / countExpensesPD) * 100).toFixed(2)
    );

    const section_data = JSON.parse(
      this.fiscalYear?.dj08[0].dj08SectionData.find(
        (val) => val.is_rectification === true
      )?.section_data
    );

    const {
      F21 = 0,
      F22 = 0,
      F23 = 0,
      F24 = 0,
      F25 = 0,
    } = section_data[SectionName.SECTION_C]["data"];

    let { F28, F29, F30 = 0 } = section_data[SectionName.SECTION_D]["data"];

    const { F34 = 0 } = section_data[SectionName.SECTION_E]["data"];

    const F26 =
      F21 >= F22 + F23 + F24 + F25 ? F21 - (F22 + F23 + F24 + F25) : 0;

    let toGiveBack = 0;

    const dj08SectionDataOld = this.fiscalYear?.dj08[0].dj08SectionData.find(
      (val) => val.is_rectification === false
    );

    if (this.fiscalYear.declared && dj08SectionDataOld) {
      const { F33: F33a = 0, F36: F36a = 0 } = JSON.parse(
        dj08SectionDataOld.section_data
      )[SectionName.SECTION_E]["data"];

      F28 = (F26 || 0) - F33a;
      F29 = F36a;
      toGiveBack = F28 - F29;
    } else {
      toGiveBack =
        this.fiscalYear.is_tcp || F21 >= F22 + F23 + F24 + F25
          ? 0
          : F21 - (F22 + F23 + F24 + F25);
    }

    const F32 = this.fiscalYear.declared ? F30 : F26;
    const F33 =
      [1, 2].indexOf(moment().month() + 1) !== -1
        ? parseFloat(((F32 * 5) / 100).toFixed())
        : 0;
    let F35 = 0;

    if (this.fiscalYear.declared) {
      const limitDate = moment(`${this.fiscalYear.year + 1}-04-30`);
      const moraDays = moment().isAfter(limitDate)
        ? calculeMoraDays(limitDate, moment())
        : 0;

      if (moraDays) {
        F35 = calculateMora(F32, F35, moraDays);
      }
    }

    const F36 = F32 - F33 - F34 + F35;
    const current_tax_debt = F36 > 0 ? F36 : toGiveBack;

    const porcentageExpensesWithDocument = expensesPDGT.length
      ? parseFloat(
          ((sumaTotalExpensesWithDocument / countExpensesPD) * 100).toFixed(2)
        )
      : 0;

    return {
      expenses_without_document: porcentageExpensesWithoutDocument,
      expenses_with_document: porcentageExpensesWithDocument,
      has_cultural_activity,
      current_tax_debt,
    };
  }
}
