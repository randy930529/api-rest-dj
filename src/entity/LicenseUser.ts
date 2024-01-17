import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Unique,
  BeforeRemove,
  AfterRemove,
} from "typeorm";
import Model from "./Base";
import { User } from "./User";
import { License } from "./License";
import { TMBill } from "./TMBill";

let tmBillToRemoveRef;

@Entity()
@Unique(["licenseKey"])
export class LicenseUser extends Model {
  @PrimaryGeneratedColumn("uuid")
  licenseKey: string;

  @Column({ nullable: true })
  expirationDate: Date;

  @Column({ default: false })
  is_paid: boolean;

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
