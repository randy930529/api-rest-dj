import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import Model from "./Base";
import { User } from "./User";
import { License } from "./License";
import { TMBill } from "./TMBill";

@Entity()
@Unique(["licenseKey"])
export class LicenseUser extends Model {
  @PrimaryGeneratedColumn("uuid")
  licenseKey: string;

  @Column({ nullable: true })
  expirationDate: Date;

  @Column({ default: false })
  is_paid: boolean;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToOne(() => License)
  @JoinColumn()
  license: License;

  @ManyToOne(() => TMBill, (tmbill) => tmbill.licenseUser)
  tmBills: TMBill[];
}
