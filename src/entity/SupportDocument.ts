import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  BeforeUpdate,
  BeforeInsert,
  AfterRemove,
  OneToOne,
  MoreThan,
  AfterInsert,
  Not,
  BeforeRemove,
} from "typeorm";
import Model from "./Base";
import * as moment from "moment";
import { Element } from "./Element";
import { FiscalYear } from "./FiscalYear";
import { ProfileActivity } from "./ProfileActivity";
import { ColumnNumericTransformer } from "../utils/ColumnNumericTransformer";
import { Voucher } from "./Voucher";

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

  @Column({ default: false })
  __last_document__: boolean;

  @ManyToOne(() => ProfileActivity, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn()
  profileActivity: ProfileActivity;

  @OneToOne(() => Voucher, (voucher) => voucher.supportDocument)
  voucher: Voucher;

  toJSON() {
    return {
      ...this,
      __fiscalYearId__: undefined,
      __year__: undefined,
      __oldGroup__: undefined,
      __last_document__: undefined,
    };
  }

  @BeforeInsert()
  @BeforeUpdate()
  async BeforeInsertAndUpdateDocument(): Promise<void> {
    await Promise.all([
      this.setfiscalYearIdAndyear__(),
      this.checkToDateInToFiscalYear(),
    ]);
  }

  @BeforeInsert()
  async setLastDocument(): Promise<void> {
    if (this.fiscalYear) {
      this.__last_document__ = true;
      const lastDocument = await SupportDocument.findOneBy({
        __fiscalYearId__: this.__fiscalYearId__,
        __last_document__: true,
      });

      if (lastDocument) {
        lastDocument.__last_document__ = false;
        await SupportDocument.save(lastDocument);
      }
    }
  }

  @BeforeRemove()
  async beforeRemoveDocument(): Promise<void> {
    await this.getLastDocument();
  }

  @AfterInsert()
  async setTrueHasDocumentsInToFiscalYear(): Promise<void> {
    await this.setHasDocumentOftheFiscalYear(true);
  }

  @AfterRemove()
  async afterRemoveDocument(): Promise<void> {
    await this.updateVoucherNumber();
  }

  private async setfiscalYearIdAndyear__(): Promise<void> {
    if (this.fiscalYear) {
      this.__fiscalYearId__ = this.fiscalYear.id;
      this.__year__ = this.fiscalYear.year;
    }
  }

  private async checkToDateInToFiscalYear(): Promise<void> {
    if (this.date && moment(this.date).year() !== this.__year__) {
      throw new Error("Fuera del rango de fecha para el año fiscal.");
    }
  }

  private async updateVoucherNumber(): Promise<void> {
    if (!this.fiscalYear?.run_acounting) return;

    const voucherToUpdateNumber = await Voucher.find({
      where: {
        supportDocument: {
          __fiscalYearId__: this.__fiscalYearId__,
        },
        number: MoreThan(this.voucher?.number),
      },
    });

    voucherToUpdateNumber.forEach((val) => {
      val.number--;
    });

    await Voucher.save(voucherToUpdateNumber);
  }

  private async getLastDocument(): Promise<void> {
    if (this.__last_document__) {
      const lastDocument = await SupportDocument.findOne({
        where: { id: Not(this.id), __fiscalYearId__: this.__fiscalYearId__ },
        order: { date: "DESC", id: "DESC" },
      });

      if (lastDocument) {
        lastDocument.__last_document__ = true;
      }
      await Promise.all([
        lastDocument?.save(),
        this.setHasDocumentOftheFiscalYear(!!lastDocument),
      ]);
    }
  }

  private async setHasDocumentOftheFiscalYear(
    has_documents: boolean
  ): Promise<void> {
    if (this.fiscalYear) {
      this.fiscalYear.has_documents = has_documents;
      await FiscalYear.save(this.fiscalYear);
    }
  }
}
