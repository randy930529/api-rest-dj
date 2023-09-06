import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import Model from "./Base";
import { Account } from "./Account";
import { Voucher } from "./Voucher";

@Entity()
export class VoucherDetail extends Model {
  @Column({ type: "numeric", precision: 19, scale: 0 })
  debe: number;

  @Column({ type: "numeric", precision: 19, scale: 0 })
  haber: number;

  @OneToOne(() => Voucher)
  @JoinColumn()
  voucher: Voucher;

  @OneToOne(() => Account)
  @JoinColumn()
  account: Account;
}
