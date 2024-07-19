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
} from "typeorm";
import Model from "./Base";
import { ColumnNumericTransformer } from "../utils/ColumnNumericTransformer";
import { Enterprise } from "./Enterprise";
import { Profile } from "./Profile";
import { Dj08SectionData, SectionName } from "./Dj08SectionData";
import {
  AllDataSectionsDj08Type,
  DataSectionHType,
  TotalSectionHType,
} from "utils/definitions";
import { SectionState } from "./SectionState";

@Entity()
export class ProfileEnterprise extends Model {
  @Column({
    type: "numeric",
    precision: 19,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column({
    type: "numeric",
    precision: 19,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  import: number;

  @ManyToOne(() => Enterprise)
  @JoinColumn()
  enterprise: Enterprise;

  @ManyToOne(() => Profile, { nullable: true, onDelete: "CASCADE" })
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
  async up__profileId__(): Promise<void> {
    if (this.profile) {
      this.__profileId__ = this.profile.id;
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

    const profileEnterprises = await ProfileEnterprise.find({
      relations: ["enterprise"],
      where: {
        profile: { id: this.__profileId__ },
      },
    });

    const { section_data: sectionDataJSONString } = dj08ToUpdate;
    const section_data: AllDataSectionsDj08Type = JSON.parse(
      sectionDataJSONString
    );

    const newDataSectionH: { [key: string | number]: DataSectionHType } = {};
    const newTotalSectionH: TotalSectionHType = { valueHire: 0, import: 0 };

    const profileEnterprisesRemoveDuplicate = profileEnterprises.reduce<{
      [key: string]: ProfileEnterprise;
    }>((acc, val) => {
      const porcentage =
        val.amount > 0
          ? parseFloat(((val.import / val.amount) * 100).toFixed(2))
          : null;

      const key = `${val.enterprise.id}${porcentage}`;
      if (acc[key]) {
        acc[key].amount += val.amount;
        acc[key].import += val.import;
      } else {
        acc[key] = val;
      }
      console.log(acc)
      return acc;
    }, {});

    const profileEnterprisesClean = Object.values(
      profileEnterprisesRemoveDuplicate
    );

    for (let i = 0; i < profileEnterprisesClean.length; i++) {
      const {
        amount,
        import: importP,
        enterprise,
      } = profileEnterprisesClean[i];

      let valueHire = parseFloat(amount.toFixed());
      let importHire = parseFloat(importP.toFixed());
      const porcentage =
        amount > 0 ? parseFloat(((importP / amount) * 100).toFixed(2)) : null;

      const data: DataSectionHType = {
        enterprise: enterprise.name,
        valueHire,
        import: importHire,
        porcentage,
      };

      newDataSectionH[`F${i + 52}`] = data;
      newTotalSectionH.valueHire += valueHire;
      newTotalSectionH.import += importHire;
    }

    section_data[SectionName.SECTION_H].data = newDataSectionH;
    section_data[SectionName.SECTION_H].totals = newTotalSectionH;

    dj08ToUpdate.section_data = JSON.stringify(section_data);
    await dj08ToUpdate.save();
  }
}
