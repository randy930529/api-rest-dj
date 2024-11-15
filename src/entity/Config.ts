import {
  BeforeInsert,
  BeforeRemove,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
} from "typeorm";
import Model from "./Base";
import { appConfig } from "../../config";
import { ColumnNumericTransformer } from "../utils/ColumnNumericTransformer";
import { Account } from "./Account";
import { ProgressiveScale } from "./ProgressiveScale";
import { User, UserRole } from "./User";

const defaultCompany = JSON.stringify({
  name: "",
  source: null,
  address: "",
  phoneNumber: "",
  email: "",
});

@Entity()
export class Config extends Model {
  @Column({ default: appConfig.emailFrom ?? "" })
  email_from: string;

  @Column({ default: appConfig.licenseFreeDays ?? 0 })
  license_free_days: number;

  @Column({ type: "integer", width: 4, nullable: true })
  inactivity_max: number;

  @Column({
    type: "numeric",
    precision: 19,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
    default: 0,
  })
  except_min: number;

  @Column({ type: "integer", width: 4, nullable: true })
  allowance: number;

  @Column({
    type: "json",
    default: defaultCompany,
  })
  company: string;

  @Column({
    type: "json",
    nullable: true,
  })
  mora_scale: string;

  @OneToOne(() => Account, { nullable: true })
  @JoinColumn()
  accountBox: Account;

  @OneToOne(() => Account, { nullable: true })
  @JoinColumn()
  accountBank: Account;

  @OneToMany(
    () => ProgressiveScale,
    (progressiveScale) => progressiveScale.config,
    { cascade: ["insert", "update"] }
  )
  progressiveScale: ProgressiveScale[];

  @OneToOne(() => Account, { nullable: true })
  @JoinColumn()
  accountLongTerm: Account;

  @OneToOne(() => Account, { nullable: true })
  @JoinColumn()
  accountShortTerm: Account;

  @OneToOne(() => User, { nullable: true })
  @JoinColumn()
  user: User;

  toJSON() {
    return {
      ...this,
      company: JSON.parse(this.company),
      mora_scale: JSON.parse(this.mora_scale),
      created_at: undefined,
      updated_at: undefined,
    };
  }

  @BeforeInsert()
  @BeforeUpdate()
  @BeforeRemove()
  checkIsUserAdmin(): void {
    if (this.user && this.user.role !== UserRole.ADMIN) {
      throw new Error("User does not have permission to perform this action.");
    }
  }
}
