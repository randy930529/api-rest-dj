import {
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
import { FiscalYear } from "./FiscalYear";

@Entity()
export class FiscalYearEnterprise extends Model {
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

  @ManyToOne(() => FiscalYear, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn()
  fiscalYear: FiscalYear;

  @Column({ nullable: true })
  __fiscalYearId__: number;

  toJSON() {
    return {
      ...this,
      __fiscalYearId__: undefined,
    };
  }

  @BeforeInsert()
  @BeforeUpdate()
  async up__fiscalYearId__(): Promise<void> {
    if (this.fiscalYear) {
      this.__fiscalYearId__ = this.fiscalYear.id;
    }
  }
}
