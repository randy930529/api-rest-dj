import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  BeforeInsert,
} from "typeorm";
import Model from "./Base";
import { SupportDocument } from "./SupportDocument";
import { VoucherDetail } from "./VoucherDetail";

@Entity()
export class Voucher extends Model {
  @Column({ type: "integer", width: 4 })
  number: number;

  @Column()
  date: Date;

  @Column({ nullable: true })
  description: string;

  @OneToOne(() => SupportDocument, { onDelete: "CASCADE" })
  @JoinColumn()
  supportDocument: SupportDocument;

  @OneToMany(() => VoucherDetail, (voucherDetail) => voucherDetail.voucher, {
    cascade: ["insert", "update"],
  })
  voucherDetails: VoucherDetail[];

  @BeforeInsert()
  async updateVoucherNumber(): Promise<void> {
    if (this.number === -1) {
      this.number =
        (await Voucher.maximum("number", {
          supportDocument: {
            __fiscalYearId__: this.supportDocument.__fiscalYearId__,
          },
        })) + 1;
    }
  }
}
