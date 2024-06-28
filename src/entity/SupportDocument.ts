import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  AfterInsert,
  AfterUpdate,
  AfterRemove,
  BeforeUpdate,
  BeforeInsert,
  IsNull,
  Not,
} from "typeorm";
import Model from "./Base";
import { Element } from "./Element";
import { FiscalYear } from "./FiscalYear";
import { ColumnNumericTransformer } from "../utils/ColumnNumericTransformer";
import * as moment from "moment";
import { ProfileActivity } from "./ProfileActivity";
import { Dj08SectionData, SectionName } from "./Dj08SectionData";
import {
  AllDataSectionsDj08Type,
  DataSectionBType,
  DataSectionGType,
  TotalSectionGType,
} from "../utils/definitions";
import {
  calculeF20ToDj08,
  calculeF26ToDj08,
  calculeF27ToDj08,
} from "../reports/utils/utilsToReports";
import { appConfig } from "../../config";

@Entity()
export class SupportDocument extends Model {
  @Column()
  description: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  document: string;

  @Column({
    type: "numeric",
    precision: 19,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column({ default: moment() })
  date: Date;

  @Column({ type: "char", length: 1 })
  type_document: string;

  @Column({ default: false })
  is_bank: boolean;

  @ManyToOne(() => Element, { onDelete: "CASCADE" })
  @JoinColumn()
  element: Element;

  @ManyToOne(() => FiscalYear, { onDelete: "CASCADE" })
  @JoinColumn()
  fiscalYear: FiscalYear;

  @Column({ nullable: true })
  __fiscalYearId__: number;

  @Column({ nullable: true })
  __year__: number;

  @ManyToOne(() => ProfileActivity, { nullable: true })
  @JoinColumn()
  profileActivity: ProfileActivity;

  toJSON() {
    return {
      ...this,
      __fiscalYearId__: undefined,
      __year__: undefined,
    };
  }

  @BeforeInsert()
  @BeforeUpdate()
  async up__fiscalYearIdAndyear__(): Promise<void> {
    if (this.fiscalYear) {
      this.__fiscalYearId__ = this.fiscalYear.id;
      this.__year__ = this.fiscalYear.year;
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  async checkToDateInToFiscalYear(): Promise<void> {
    if (this.date && moment(this.date).year() != this.__year__) {
      throw new Error("Out of date in to fiscal year.");
    }
  }

  @AfterInsert()
  @AfterUpdate()
  @AfterRemove()
  async updatedDJ08(): Promise<void> {
    const dj08ToUpdate = await Dj08SectionData.findOne({
      where: {
        dJ08: { fiscalYear: { id: this.__fiscalYearId__ } },
        is_rectification: true,
      },
    });

    const documents = await SupportDocument.find({
      select: {
        element: { id: true, description: true, type: true, group: true },
      },
      relations: ["element"],
      where: {
        id: Not(this.id),
        fiscalYear: { id: this.__fiscalYearId__ },
        profileActivity: IsNull(),
      },
    });
    documents.push(this);

    const { section_data: sectionDataJSONString } = dj08ToUpdate;
    const section_data: AllDataSectionsDj08Type = JSON.parse(
      sectionDataJSONString
    );

    switch (this.type_document) {
      case "m":
        const paidTributes = documents.filter(
          (val) => val.element.type === "m"
        );

        const expensesBookTTI19 = paidTributes.reduce(
          (sumTotal, val) =>
            val.element.group.trim() === "tprz"
              ? sumTotal + val.amount
              : sumTotal,
          0
        );

        const expensesBookTTJ19 = paidTributes.reduce(
          (sumTotal, val) =>
            val.element.group.trim() === "tpcm"
              ? sumTotal + val.amount
              : sumTotal,
          0
        );

        section_data[SectionName.SECTION_B].data["F15"] = expensesBookTTI19;
        section_data[SectionName.SECTION_C].data["F22"] = expensesBookTTJ19;

        const dataSectionC = section_data[SectionName.SECTION_C].data as {
          [key: string]: number;
        };
        section_data[SectionName.SECTION_C].data["F26"] =
          calculeF26ToDj08(dataSectionC);
        section_data[SectionName.SECTION_C].data["F27"] =
          calculeF27ToDj08(dataSectionC);

        const dataSectionF = section_data[SectionName.SECTION_F].data as {
          [key: string]: DataSectionBType;
        };
        paidTributes.reduce<{
          [id: string | number]:
            | number
            | {
                row: string;
                sumTotal: number;
                concepto: string;
              };
        }>(
          (objIndexById, document) => {
            const previousObj = objIndexById[document.id] as {
              row: string;
              sumTotal: number;
              concepto: string;
            };
            const count = objIndexById["count"] as number;
            const totals = (objIndexById["totals"] as number) + document.amount;
            const sumTotal = previousObj
              ? previousObj.sumTotal + document.amount
              : document.amount;

            if (document.element.group.trim() === "tp") {
              const obj = previousObj
                ? { ...previousObj, sumTotal }
                : {
                    row: `F${count}`,
                    sumTotal,
                    concepto: document.element.description,
                  };

              objIndexById["count"] = previousObj ? count : count + 1;
              objIndexById["totals"] = totals;
              objIndexById[document.id] = obj;
              dataSectionF[obj.row] = {
                import: sumTotal,
                concepto: obj.concepto,
              };
              dataSectionF["F44"] = {
                concepto: "Total de tributos pagados",
                import: totals,
              };
            } else if (document.element.group.trim() === "ot") {
              const obj = {
                row: "F43",
                sumTotal,
                concepto: document.description,
              };

              objIndexById[document.id] = obj;
              objIndexById["totals"] = totals;
              dataSectionF[obj.row] = {
                import: sumTotal,
                concepto: obj.concepto,
              };
              dataSectionF["F44"] = {
                concepto: "Total de tributos pagados",
                import: totals,
              };
            }

            return objIndexById;
          },
          { count: 37, totals: 0 }
        );
        section_data[SectionName.SECTION_F].data = dataSectionF;
        section_data[SectionName.SECTION_B].data["F14"] =
          dataSectionF["F44"].import;
        break;

      case "g":
        const expenses = documents.filter(
          (val) =>
            val.element.type === "g" && val.element.group?.trim() === "ddgt"
        );

        const expensesBookTGP19 = expenses.reduce(
          (sumaTotal, val) =>
            val.element.is_general ? sumaTotal + val.amount : sumaTotal,
          0
        );

        section_data[SectionName.SECTION_B].data["F16"] = expensesBookTGP19;
        break;

      case "o":
        const group = this.element.group?.trim();
        const allDocumentToGroup = documents.filter(
          (val) =>
            val.element.type === "o" && val.element.group?.trim() === group
        );

        const upFile = allDocumentToGroup.reduce(
          (sumaTotal, val) => sumaTotal + val.amount,
          0
        );

        const dataSectionB = section_data[SectionName.SECTION_B].data as {
          [key: string]: number;
        };

        if (group === "onex") {
          section_data[SectionName.SECTION_B].data["F17"] = upFile;
        } else if (group === "onda") {
          section_data[SectionName.SECTION_B].data["F18"] = upFile;
        } else if (group === "onfp") {
          section_data[SectionName.SECTION_B].data["F19"] = upFile;
        } else if (group === "onpa") {
          section_data[SectionName.SECTION_C].data["F23"] = upFile;
        } else if (group === "onrt") {
          section_data[SectionName.SECTION_C].data["F24"] = upFile;
        } else if (group === "onbn") {
          section_data[SectionName.SECTION_C].data["F25"] = upFile;
        } else if (group === "onde") {
          section_data[SectionName.SECTION_E].data["F34"] = upFile;
        }
        break;

      default:
        break;
    }

    const dataSectionB = section_data[SectionName.SECTION_B].data as {
      [key: string]: number;
    };
    section_data[SectionName.SECTION_B].data["F20"] =
      calculeF20ToDj08(dataSectionB);

    const { constantToSectionG } = appConfig;
    const F20 = section_data[SectionName.SECTION_B].data["F20"] as number;

    const dataSectionG = section_data[SectionName.SECTION_G].data as {
      [key: string]: DataSectionGType;
    };
    const totalSectionG: TotalSectionGType = {
      baseImponible: 0,
      import: 0,
    };

    constantToSectionG.reduce((count, val) => {
      const { from, to, porcentageType } = val;
      let baseImponible = 0;

      if (to === null) {
        baseImponible =
          F20 > from ? F20 - (totalSectionG?.baseImponible || 0) : 0;
      } else {
        baseImponible =
          F20 > to ? to - from : F20 - (totalSectionG?.baseImponible || 0);
      }

      const importe = (baseImponible * porcentageType) / 100;

      const newRow: DataSectionGType = {
        ...val,
        baseImponible,
        import: importe,
      };

      dataSectionG[`F${count}`] = newRow;
      totalSectionG["baseImponible"] += baseImponible;
      totalSectionG["import"] += importe;

      return count + 1;
    }, 45);
    section_data[SectionName.SECTION_G] = {
      data: dataSectionG,
      totals: totalSectionG,
    };
    section_data[SectionName.SECTION_C].data["F21"] = totalSectionG.import;

    dj08ToUpdate.section_data = JSON.stringify(section_data);
    await dj08ToUpdate.save();
  }
}
