import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import Model from "./Base";
import { SupportDocument } from "./SupportDocument";

@Entity()
export class Voucher extends Model {
  @Column({ type: "integer", width: 4 })
  number: number;

  @Column()
  date: Date;

  @Column({ nullable: true })
  description: string;

  @OneToOne(() => SupportDocument)
  @JoinColumn()
  supportDocument: SupportDocument;
}
