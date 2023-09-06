import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";
import { Tax } from "./Tax";

@Entity()
export class TaxPaid extends Model {
  @Column({ type: "numeric", precision: 19, scale: 0 })
  import: number;

  @Column()
  date: Date;

  @OneToOne(() => Profile)
  @JoinColumn()
  profile: Profile;

  @OneToOne(() => Tax)
  @JoinColumn()
  tax: Tax;
}
