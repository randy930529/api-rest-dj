import { Entity, Column, JoinColumn, ManyToOne } from "typeorm";
import Model from "./Base";
import { ExpenseElement } from "./ExpenseElement";
import { FiscalYear } from "./FiscalYear";
import { ColumnNumericTransformer } from "../utils/ColumnNumericTransformer";
import { Tax } from "./Tax";

@Entity()
export class SupportDocument extends Model {
  @Column()
  description: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  document: string;

  @Column({
    type: "numeric",
    precision: 19,
    scale: 0,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column({ type: "time", precision: 7 })
  date: string;

  @Column({ type: "char", length: 1 })
  type_document: string;

  @Column({ default: false })
  is_bank: boolean;

  @ManyToOne(() => ExpenseElement)
  @JoinColumn()
  expenseElement: ExpenseElement;

  @ManyToOne(() => FiscalYear)
  @JoinColumn()
  fiscalYear: FiscalYear;

  @ManyToOne(() => Tax)
  @JoinColumn()
  tax: Tax;
}
