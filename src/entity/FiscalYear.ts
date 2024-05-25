import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  AfterInsert,
  BeforeRemove,
} from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";
import * as moment from "moment";
import { Dj08SectionData } from "./Dj08SectionData";
import { appConfig } from "../../config";

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

  @AfterInsert()
  async insertNewDJ08WithThisFiscalYearAndProfile(): Promise<void> {
    const { MEa_By_MFP } = appConfig.accountingConstants;
    const data = {
      1: {
        data: {},
        totals: {},
      },
      2: {
        data: { F12: MEa_By_MFP },
      },
      3: {
        data: {},
      },
      4: {
        data: {},
      },
      5: {
        data: {},
      },
      6: {
        data: {},
      },
      7: {
        data: {},
        totals: {},
      },
      8: {
        data: {},
        totals: {},
      },
      9: {
        data: {},
        totals: {},
      },
    };
    const section_data = JSON.stringify(data);

    const newDj08Data = await Dj08SectionData.create({
      dJ08: { fiscalYear: this, profile: this.profile },
      section_data,
    });

    newDj08Data.save();
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
