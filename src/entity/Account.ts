import { Entity, Column, JoinColumn, ManyToOne } from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";
import { Element } from "./Element";

@Entity()
export class Account extends Model {
  @Column({ type: "varchar", length: 20 })
  code: string;

  @Column({ type: "varchar", length: 120 })
  description: string;

  @Column({ type: "char", length: 1 })
  type: string;

  @Column({ type: "varchar", length: 120 })
  moneda: string;

  @Column({ default: false })
  acreedor: boolean;

  @ManyToOne(() => Profile)
  @JoinColumn()
  profile: Profile;

  @ManyToOne(() => Element, (element) => element.account)
  @JoinColumn()
  elements: Element[];
}
