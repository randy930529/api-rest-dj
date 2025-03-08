import { Entity, Column, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import Model from "./Base";
import { Account } from "./Account";
import { Voucher } from "./Voucher";
import { ColumnNumericTransformer } from "../utils/ColumnNumericTransformer";
import { Mayor } from "./Mayor";

@Entity()
export class VoucherDetail extends Model {
  @Column({
    type: "numeric",
    precision: 19,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  debe: number;

  @Column({
    type: "numeric",
    precision: 19,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  haber: number;

  @ManyToOne(() => Voucher, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn()
  voucher: Voucher;

  @ManyToOne(() => Account)
  @JoinColumn()
  account: Account;

  @OneToOne(() => Mayor, (mayor) => mayor.voucherDetail, {
    cascade: ["insert", "update"],
  })
  mayor: Mayor;
}
