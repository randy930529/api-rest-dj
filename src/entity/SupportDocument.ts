import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import Model from "./Base";
import { ExpenseElement } from "./ExpenseElement";
import { FiscalYear } from "./FiscalYear";

@Entity()
export class SupportDocument extends Model {
  @Column()
  description: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  document: string;

  @Column({ type: "numeric", precision: 19, scale: 0 })
  amount: number;

  @Column({ type: "time", precision: 7 })
  date: string;

  @Column({ type: "char", length: 1 })
  type_document: string;

  @Column({ default: false })
  is_bank: boolean;

  @OneToOne(() => ExpenseElement)
  @JoinColumn()
  expenseElement: ExpenseElement;

  @OneToOne(() => FiscalYear)
  @JoinColumn()
  fiscalYear: FiscalYear;
}
