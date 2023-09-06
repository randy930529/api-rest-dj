import { Entity, Column, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";

@Entity()
export class Account extends Model {
  @Column({ type: "varchar", length: 20 })
  code: string;

  @Column({ type: "varchar", length: 120 })
  description: string;

  @Column({ type: "varchar", length: 120 })
  moneda: string;

  @Column({ default: false })
  acreedor: boolean;

  @ManyToOne(() => Profile)
  @JoinColumn()
  profile: Profile;
}
