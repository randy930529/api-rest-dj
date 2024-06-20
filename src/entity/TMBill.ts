import { BeforeRemove, Column, Entity, OneToMany } from "typeorm";
import * as moment from "moment";
import Model from "./Base";
import { ColumnNumericTransformer } from "../utils/ColumnNumericTransformer";
import { StateTMBill } from "./StateTMBill";
import { LicenseUser } from "./LicenseUser";
import { appConfig } from "../../config";

@Entity()
export class TMBill extends Model {
  @Column({
    type: "numeric",
    precision: 19,
    scale: 4,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  import: number;

  @Column({ type: "varchar", length: 5, default: "CUP" })
  currency: string;

  @Column({ nullable: true, default: "test" })
  description: string;

  @Column({ nullable: true })
  orderIdTM: string;

  @Column({ nullable: true })
  bankId: string;

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

  @Column({ default: moment().add(appConfig.validTimeTMBill, "s").toDate() })
  validDate: Date;

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
