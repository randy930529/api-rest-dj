import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import Model from "./Base";
import { User } from "./User";
import { License } from "./License";

@Entity()
export class LicenseUser extends Model {
  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToOne(() => License)
  @JoinColumn()
  license: License;

  @Column({ default: false })
  active: boolean;
}
