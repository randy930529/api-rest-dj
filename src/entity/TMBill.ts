import { BeforeRemove, Column, Entity, OneToMany } from "typeorm";
import Model from "./Base";
import { ColumnNumericTransformer } from "../utils/ColumnNumericTransformer";
import { StateTMBill } from "./StateTMBill";
import { LicenseUser } from "./LicenseUser";

@Entity()
export class TMBill extends Model {
  @Column({
    type: "numeric",
    precision: 19,
    scale: 0,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  import: number;

  @Column({ type: "varchar", length: 5, default: "cup" })
  currency: string;

  @Column()
  date: Date;

  @Column({ nullable: true, default: "" })
  description: string;

  @Column({ nullable: true })
  orderIdTM: string;

  @Column({ type: "integer", width: 4, nullable: true })
  bankId: number;

  @Column({ nullable: true })
  bank: string;

  @Column({ length: 10, nullable: true })
  phone: string;

  @Column({ type: "integer", width: 4, nullable: true })
  refundId: number;

  @Column({ type: "integer", width: 4, nullable: true })
  referenceRefund: number;

  @Column({ type: "integer", width: 4, nullable: true })
  referenceRefundTM: number;

  @OneToMany(() => StateTMBill, (stateTMBill) => stateTMBill.tmBill, {
    onDelete: "CASCADE",
  })
  stateTMBills: StateTMBill[];

  @OneToMany(() => LicenseUser, (licenseUser) => licenseUser.tmBill)
  licenseUser: LicenseUser[];

  @BeforeRemove()
  async removeMyStateTMBill(): Promise<void> {
    const stateTMBill = await StateTMBill.findOne({
      where: { tmBill: { id: this.id } },
    });

    if (stateTMBill) {
      await stateTMBill.remove();
    }
  }
}
