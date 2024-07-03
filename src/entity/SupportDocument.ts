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
  DataSectionAType,
  DataSectionBType,
  DataSectionGType,
  TotalSectionAType,
  TotalSectionGType,
} from "../utils/definitions";
import { calculeF20ToDj08 } from "../reports/utils/utilsToReports";
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
        element: {
          id: true,
          description: true,
          type: true,
          group: true,
          is_general: true,
        },
      },
      relations: ["element"],
      where: {
        id: Not(this.id),
        fiscalYear: { id: this.__fiscalYearId__ },
      },
    });
    documents.push(this);

    const { section_data: sectionDataJSONString } = dj08ToUpdate;
    const section_data: AllDataSectionsDj08Type = JSON.parse(
      sectionDataJSONString
    );
    const profileActivities =
      this.type_document === "g" || this.type_document === "i"
        ? await ProfileActivity.find({
            select: {
              supportDocuments: {
                id: true,
                type_document: true,
                amount: true,
                element: { id: true, group: true, is_general: true },
              },
              activity: { id: true, code: true, description: true },
            },
            relations: { activity: true, supportDocuments: { element: true } },
            where: {
              supportDocuments: {
                fiscalYear: { id: this.__fiscalYearId__ },
              },
            },
          })
        : [];

    switch (this.type_document) {
      case "m":
        const paidTributes = documents.filter(
          (val) => val.element.type === "m"
        );
        const dataSectionF = section_data[SectionName.SECTION_F].data as {
          [key: string]: DataSectionBType;
        };

        if (this.element.group?.trim() === "tprz") {
          const expensesBookTTI19 = paidTributes.reduce(
            (sumTotal, val) =>
              val.element.group.trim() === "tprz"
                ? sumTotal + val.amount
                : sumTotal,
            0
          );
          section_data[SectionName.SECTION_B].data["F15"] = expensesBookTTI19;
        } else if (this.element.group?.trim() === "tpcm") {
          const expensesBookTTJ19 = paidTributes.reduce(
            (sumTotal, val) =>
              val.element.group.trim() === "tpcm"
                ? sumTotal + val.amount
                : sumTotal,
            0
          );

          section_data[SectionName.SECTION_C].data["F22"] = expensesBookTTJ19;
        } else if (this.element.group?.trim() === "tpsv") {
          const expensesBookTTB19 = paidTributes.reduce(
            (sumTotal, val) =>
              val.element.group.trim() === "tpsv"
                ? sumTotal + val.amount
                : sumTotal,
            0
          );

          dataSectionF["F37"] = {
            import: expensesBookTTB19,
          };
          dataSectionF["F38"] = {
            import: null,
          };
        } else if (this.element.group?.trim() === "tpft") {
          const expensesBookTTC19 = paidTributes.reduce(
            (sumTotal, val) =>
              val.element.group.trim() === "tpft"
                ? sumTotal + val.amount
                : sumTotal,
            0
          );

          dataSectionF["F39"] = {
            import: expensesBookTTC19,
          };
        } else if (this.element.group?.trim() === "tpdc") {
          const expensesBookTTD19 = paidTributes.reduce(
            (sumTotal, val) =>
              val.element.group.trim() === "tpdc"
                ? sumTotal + val.amount
                : sumTotal,
            0
          );

          dataSectionF["F40"] = {
            import: expensesBookTTD19,
          };
        } else if (this.element.group?.trim() === "tpdc") {
          const expensesBookTTD19 = paidTributes.reduce(
            (sumTotal, val) =>
              val.element.group.trim() === "tpdc"
                ? sumTotal + val.amount
                : sumTotal,
            0
          );

          dataSectionF["F40"] = {
            import: expensesBookTTD19,
          };
        } else if (this.element.group?.trim() === "tpan") {
          const expensesBookTTE19 = paidTributes.reduce(
            (sumTotal, val) =>
              val.element.group.trim() === "tpan"
                ? sumTotal + val.amount
                : sumTotal,
            0
          );

          dataSectionF["F41"] = {
            import: expensesBookTTE19,
          };
        } else if (this.element.group?.trim() === "tpcs") {
          const expensesBookTTF19 = paidTributes.reduce(
            (sumTotal, val) =>
              val.element.group.trim() === "tpcs"
                ? sumTotal + val.amount
                : sumTotal,
            0
          );

          dataSectionF["F42"] = {
            import: expensesBookTTF19,
          };
        } else if (this.element.group?.trim() === "tpot") {
          const expensesBookTTG19 = paidTributes.reduce(
            (sumTotal, val) =>
              val.element.group.trim() === "tpot"
                ? sumTotal + val.amount
                : sumTotal,
            0
          );

          dataSectionF["F43"] = {
            import: expensesBookTTG19,
          };
        }

        const importF44 = parseFloat(
          Object.values(dataSectionF)
            .reduce((sumaTotal, val) => sumaTotal + val.import, 0)
            .toFixed(2)
        );
        dataSectionF["F44"] = {
          import: importF44,
        };
        section_data[SectionName.SECTION_F].data = dataSectionF;
        section_data[SectionName.SECTION_B].data["F14"] = importF44;
        break;

      case "g":
        const newDataSectionAG: { [key: string | number]: DataSectionAType } =
          {};
        const newTotalSectionAG: TotalSectionAType = {
          incomes: 0,
          expenses: 0,
        };

        for (let i = 0; i < profileActivities.length; i++) {
          const activity = profileActivities[i];
          const { date_start, date_end } = activity;
          const { code, description } = activity.activity;
          const date_start_day = moment(date_start).date();
          const date_start_month = moment(date_start).month() + 1;
          const date_end_day = moment(date_end).date();
          const date_end_month = moment(date_end).month() + 1;
          const { income, expense } = activity.supportDocuments.reduce(
            (sumaTotal, val) => {
              if (
                val.type_document === "i" &&
                val.element.group?.trim() === "iggv"
              ) {
                sumaTotal.income = parseFloat(
                  (sumaTotal.income + val.amount).toFixed(2)
                );
              } else if (
                val.type_document === "g" &&
                val.element.group?.startsWith("pd")
              ) {
                sumaTotal.expense = parseFloat(
                  (sumaTotal.expense + val.amount).toFixed(2)
                );
              }

              return sumaTotal;
            },
            { income: 0, expense: 0 }
          );

          const data: DataSectionAType = {
            activity: `${code} - ${description}`,
            period: {
              start: [date_start_day, date_start_month],
              end: [date_end_day, date_end_month],
            },
            income,
            expense,
          };
          newDataSectionAG[`F${i + 1}`] = data;
          newTotalSectionAG.incomes += income;
          newTotalSectionAG.expenses += expense;
        }
        section_data[SectionName.SECTION_A].data = newDataSectionAG;
        section_data[SectionName.SECTION_A].totals = newTotalSectionAG;
        section_data[SectionName.SECTION_B].data["F11"] =
          newTotalSectionAG.incomes;
        section_data[SectionName.SECTION_B].data["F13"] =
          newTotalSectionAG.expenses;

        const expensesDD = documents.filter(
          (val) =>
            val.element.type === "g" &&
            val.element.is_general &&
            val.element.group?.trim() === "ddgt"
        );

        const expensesBookTGP19 = expensesDD.reduce(
          (sumaTotal, val) => sumaTotal + val.amount,
          0
        );

        section_data[SectionName.SECTION_B].data["F16"] = parseFloat(
          expensesBookTGP19.toFixed(2)
        );
        break;

      case "i":
        const newDataSectionA: { [key: string | number]: DataSectionAType } =
          {};
        const newTotalSectionA: TotalSectionAType = {
          incomes: 0,
          expenses: 0,
        };

        for (let i = 0; i < profileActivities.length; i++) {
          const activity = profileActivities[i];
          const { date_start, date_end } = activity;
          const { code, description } = activity.activity;
          const date_start_day = moment(date_start).date();
          const date_start_month = moment(date_start).month() + 1;
          const date_end_day = moment(date_end).date();
          const date_end_month = moment(date_end).month() + 1;
          const { income, expense } = activity.supportDocuments.reduce(
            (sumaTotal, val) => {
              if (
                val.type_document === "i" &&
                val.element.group?.trim() === "iggv"
              ) {
                sumaTotal.income = parseFloat(
                  (sumaTotal.income + val.amount).toFixed(2)
                );
              } else if (
                val.type_document === "g" &&
                val.element.group?.startsWith("pd")
              ) {
                sumaTotal.expense = parseFloat(
                  (sumaTotal.expense + val.amount).toFixed(2)
                );
              }

              return sumaTotal;
            },
            { income: 0, expense: 0 }
          );

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
        section_data[SectionName.SECTION_B].data["F11"] =
          newTotalSectionA.incomes;
        section_data[SectionName.SECTION_B].data["F13"] =
          newTotalSectionA.expenses;
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

      const importe = parseFloat(
        ((baseImponible * porcentageType) / 100).toFixed()
      );

      const newRow: DataSectionGType = {
        ...val,
        baseImponible: parseFloat(baseImponible.toFixed()),
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
