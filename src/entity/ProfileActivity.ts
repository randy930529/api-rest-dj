import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
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
import { Dj08SectionData, SectionName } from "./Dj08SectionData";
import {
  AllDataSectionsDj08Type,
  DataSectionAType,
  TotalSectionAType,
} from "utils/definitions";
import * as moment from "moment";
import { SectionState } from "./SectionState";
import { calculeF20ToDj08 } from "../reports/utils/utilsToReports";
import { ProfileHiredPersonActivity } from "./ProfileHiredPersonActivity";

@Entity()
export class ProfileActivity extends Model {
  @Column()
  date_start: Date;

  @Column()
  date_end: Date;

  @ManyToOne(() => Profile)
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

  toJSON() {
    return {
      ...this,
      __profileId__: undefined,
    };
  }

  @BeforeInsert()
  @BeforeUpdate()
  async up__profileId__(): Promise<void> {
    if (this.profile) {
      this.__profileId__ = this.profile.id;
    }

    if (this.activity) {
      const activityWithSameName = await ProfileActivity.findOne({
        where: {
          profile: { id: this.profile?.id },
          activity: { id: this.activity?.id },
        },
      });

      if (activityWithSameName && this.id != activityWithSameName?.id) {
        throw new Error("Only a activity with the same name is allowed.");
      }
    }
  }

  @AfterInsert()
  @AfterUpdate()
  @AfterRemove()
  async updatedDJ08(): Promise<void> {
    const section = await SectionState.findOne({
      select: { fiscalYear: { id: true } },
      relations: ["fiscalYear"],
      where: { profile: { id: this.__profileId__ } },
    });
    const { id: fiscalYearId } = section.fiscalYear;

    const dj08ToUpdate = await Dj08SectionData.findOne({
      where: {
        dJ08: {
          profile: { id: this.__profileId__ },
          fiscalYear: { id: fiscalYearId },
        },
        is_rectification: false,
      },
    });

    const profileActivities = await ProfileActivity.find({
      relations: ["activity", "supportDocuments"],
      where: {
        profile: { id: this.__profileId__ },
        supportDocuments: { fiscalYear: { id: fiscalYearId } },
      },
    });

    const { section_data: sectionDataJSONString } = dj08ToUpdate;
    const section_data: AllDataSectionsDj08Type = JSON.parse(
      sectionDataJSONString
    );

    const newDataSectionA: { [key: string | number]: DataSectionAType } = {};
    const newTotalSectionA: TotalSectionAType = { incomes: 0, expenses: 0 };

    for (let i = 0; i < profileActivities.length; i++) {
      const activity = profileActivities[i];
      const { date_start, date_end } = activity;
      const { code, description } = activity.activity;
      const date_start_day = moment(date_start).date();
      const date_start_month = moment(date_start).month() + 1;
      const date_end_day = moment(date_end).date();
      const date_end_month = moment(date_end).month() + 1;
      const income =
        activity.supportDocuments.find((val) => val.type_document === "i")
          ?.amount || 0;
      const expense =
        activity.supportDocuments.find((val) => val.type_document === "g")
          ?.amount || 0;

      const data: DataSectionAType = {
        activity: `${code} - ${description}`,
        period: {
          start: [date_start_day, date_start_month],
          end: [date_end_day, date_end_month],
        },
        income,
        expense,
      };
      newDataSectionA[`F${i + 1}`] = data;
      newTotalSectionA.incomes += income;
      newTotalSectionA.expenses += expense;
    }
    section_data[SectionName.SECTION_A].data = newDataSectionA;
    section_data[SectionName.SECTION_A].totals = newTotalSectionA;
    section_data[SectionName.SECTION_B].data["F11"] = newTotalSectionA.incomes;
    section_data[SectionName.SECTION_B].data["F13"] = newTotalSectionA.expenses;

    const dataSectionB = section_data[SectionName.SECTION_B].data as {
      [key: string]: number;
    };
    section_data[SectionName.SECTION_B].data["F20"] =
      calculeF20ToDj08(dataSectionB);

    dj08ToUpdate.section_data = JSON.stringify(section_data);
    await dj08ToUpdate.save();
  }
}
