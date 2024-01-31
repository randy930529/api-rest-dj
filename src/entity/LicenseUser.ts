import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  BeforeRemove,
  AfterRemove,
  AfterInsert,
  AfterUpdate,
} from "typeorm";
import Model from "./Base";
import { User } from "./User";
import { License } from "./License";
import { TMBill } from "./TMBill";
import { appConfig } from "../../config";
import * as moment from "moment";

let tmBillToRemoveRef;

@Entity()
@Unique(["licenseKey"])
export class LicenseUser extends Model {
  @Column({
    type: "varchar",
    length: 20,
  })
  licenseKey: string;

  @Column({
    nullable: true,
    default: moment().add(appConfig.licenseFreeDays, "d").toDate(),
  })
  expirationDate: Date;

  @Column({ default: false })
  is_paid: boolean;

  @Column({ type: "integer", width: 4, default: 1 })
  max_profiles: number;

  @ManyToOne(() => User, { cascade: ["update"] })
  @JoinColumn()
  user: User;

  @ManyToOne(() => License)
  @JoinColumn()
  license: License;

  @ManyToOne(() => TMBill, { cascade: true })
  @JoinColumn()
  tmBill: TMBill;

  @Column({ nullable: true })
  payMentUrl: string;

  @BeforeRemove()
  async savetmBillToRemoveRef(): Promise<void> {
    const ref = await LicenseUser.findOne({
      relations: ["tmBill"],
      where: { id: this.id },
    });

    if (ref.tmBill) {
      tmBillToRemoveRef = ref.tmBill;
    }
  }

  @AfterRemove()
  async removeTMBill(): Promise<void> {
    if (tmBillToRemoveRef) {
      tmBillToRemoveRef.remove();
    }
  }

  @AfterInsert()
  @AfterUpdate()
  async setRemovePayMentUrlIfIsPaid(): Promise<void> {
    if (this.is_paid || moment().isAfter(this.expirationDate)) {
      this.payMentUrl = null;
    }
  }
}
