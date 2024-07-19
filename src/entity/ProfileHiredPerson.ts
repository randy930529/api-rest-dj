import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  AfterInsert,
  AfterUpdate,
  AfterRemove,
  BeforeInsert,
  BeforeUpdate,
  Not,
  OneToMany,
} from "typeorm";
import Model from "./Base";
import { HiredPerson } from "./HiredPerson";
import { Profile } from "./Profile";
import { ColumnNumericTransformer } from "../utils/ColumnNumericTransformer";
import { Dj08SectionData, SectionName } from "./Dj08SectionData";
import {
  AllDataSectionsDj08Type,
  DataSectionIType,
  TotalSectionIType,
} from "utils/definitions";
import { SectionState } from "./SectionState";
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
  async up__profileId__(): Promise<void> {
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
          `It is possible that this person is hired for this date.`
        );
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
        is_rectification: true,
      },
    });

    const profileHiredPersonActivity = await ProfileHiredPersonActivity.find({
      select: {
        profileHiredPerson: {
          id: true,
          date_start: true,
          date_end: true,
          import: true,
          hiredPerson: {
            id: true,
            ci: true,
            first_name: true,
            last_name: true,
            address: { id: true, municipality: true },
          },
        },
        profileActivity: {
          id: true,
          activity: { id: true, code: true },
        },
      },
      relations: {
        profileHiredPerson: {
          hiredPerson: { address: true },
        },
        profileActivity: { activity: true },
      },
      where: { profileHiredPerson: { profile: { id: this.__profileId__ } } },
    });

    const { section_data: sectionDataJSONString } = dj08ToUpdate;
    const section_data: AllDataSectionsDj08Type = JSON.parse(
      sectionDataJSONString
    );

    const newDataSectionI: { [key: string | number]: DataSectionIType } = {};
    const newTotalSectionI: TotalSectionIType = { import: 0 };

    const profileHiredPersonActivityRemoveDuplicate =
      profileHiredPersonActivity.reduce<{
        [key: string]: ProfileHiredPersonActivity;
      }>((acc, val) => {
        const code = val.profileActivity.activity.code;
        if (
          acc[code] &&
          acc[code].profileHiredPerson.id === val.profileHiredPerson.id
        ) {
          acc[code].annual_cost += val.annual_cost;
        } else {
          acc[code] = val;
        }
        return acc;
      }, {});

    const profileHiredPersonActivityClean = Object.values(
      profileHiredPersonActivityRemoveDuplicate
    );
    console.log(profileHiredPersonActivity, profileHiredPersonActivityClean);

    for (let i = 0; i < profileHiredPersonActivityClean.length; i++) {
      const { hiredPerson, date_start, date_end } =
        profileHiredPersonActivity[i]?.profileHiredPerson;
      const { ci: nit, first_name, last_name, address } = hiredPerson;
      const { profileActivity, annual_cost } = profileHiredPersonActivity[i];

      const code = profileActivity?.activity.code.padEnd(3);
      const fullName = `${first_name} ${last_name}`;
      const from = [date_start.getDate(), date_start.getMonth() + 1];
      const to = [date_end.getDate(), date_end.getMonth() + 1];
      const { municipality } = address;

      const data: DataSectionIType = {
        code,
        fullName,
        from,
        to,
        municipality,
        nit,
        import: annual_cost,
      };
      newDataSectionI[`F${i + 64}`] = data;
      newTotalSectionI.import += annual_cost;
    }
    section_data[SectionName.SECTION_I].data = newDataSectionI;
    section_data[SectionName.SECTION_I].totals = newTotalSectionI;

    dj08ToUpdate.section_data = JSON.stringify(section_data);
    await dj08ToUpdate.save();
  }
}
