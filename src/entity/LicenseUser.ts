import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  BeforeRemove,
  AfterRemove,
} from "typeorm";
import Model from "./Base";
import { User } from "./User";
import { License } from "./License";
import { TMBill } from "./TMBill";
import { appConfig } from "../../config";
import * as moment from "moment";
import { v4 as uuidv4 } from "uuid";

let tmBillToRemoveRef;

@Entity()
@Unique(["licenseKey"])
export class LicenseUser extends Model {
  @Column({
    type: "varchar",
    length: 20,
    default: uuidv4().substring(0, 20),
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
}
