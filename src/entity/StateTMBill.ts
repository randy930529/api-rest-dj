import { Column, Entity, ManyToOne } from "typeorm";
import Model from "./Base";
import { TMBill } from "./TMBill";

@Entity()
export class StateTMBill extends Model {
  @Column()
  date: Date;

  @Column()
  description: string;

  @ManyToOne(() => TMBill, (bill) => bill.stateTMBills)
  tmBill: TMBill;
}
