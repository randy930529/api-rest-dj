import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import Model from "./Base";
import { User } from "./User";
import { License } from "./License";

@Entity()
export class LicenseUser extends Model {
  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToOne(() => License)
  @JoinColumn()
  license: License;

  @Column({ default: false })
  active: boolean;
}
