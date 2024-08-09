import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  BeforeUpdate,
  BeforeInsert,
} from "typeorm";
import Model from "./Base";
import * as moment from "moment";
import { Element } from "./Element";
import { FiscalYear } from "./FiscalYear";
import { ProfileActivity } from "./ProfileActivity";
import { ColumnNumericTransformer } from "../utils/ColumnNumericTransformer";

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

  @Column({ nullable: true })
  __oldGroup__: string;

  @ManyToOne(() => ProfileActivity, { nullable: true })
  @JoinColumn()
  profileActivity: ProfileActivity;

  toJSON() {
    return {
      ...this,
      __fiscalYearId__: undefined,
      __year__: undefined,
      __oldGroup__: undefined,
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
    if (this.date && moment(this.date).year() !== this.__year__) {
      throw new Error("Fuera del rango de fecha para el año fiscal.");
    }
  }
}
