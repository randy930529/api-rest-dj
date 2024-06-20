import { Entity, Column, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import Model from "./Base";
import { Account } from "./Account";
import { Voucher } from "./Voucher";
import { ColumnNumericTransformer } from "../utils/ColumnNumericTransformer";

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

  @ManyToOne(() => Voucher)
  @JoinColumn()
  voucher: Voucher;

  @OneToOne(() => Account)
  @JoinColumn()
  account: Account;
}
