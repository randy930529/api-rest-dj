import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import Model from "./Base";
import { ColumnNumericTransformer } from "../utils/ColumnNumericTransformer";
import { VoucherDetail } from "./VoucherDetail";
import { Account } from "./Account";
import { FiscalYear } from "./FiscalYear";

@Entity()
export class Mayor extends Model {
  @Column()
  date: Date;

  @Column({
    type: "numeric",
    precision: 19,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  saldo: number;

  @Column({ default: false })
  is_reference: boolean;

  @OneToOne(() => VoucherDetail, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn()
  voucherDetail: VoucherDetail;

  @ManyToOne(() => Account)
  @JoinColumn()
  account: Account;

  @ManyToOne(() => FiscalYear)
  @JoinColumn()
  fiscalYear: FiscalYear;
}
