import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import Model from "./Base";
import { TMBill } from "./TMBill";

@Entity()
export class StateTMBill extends Model {
  @Column({ default: false })
  success: boolean;

  @Column()
  description: string;

  @ManyToOne(() => TMBill, { cascade: ["insert", "update", "remove"] })
  @JoinColumn()
  tmBill: TMBill;
}
