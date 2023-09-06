import { Entity, Column, JoinColumn, ManyToOne } from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";
import { Tax } from "./Tax";

@Entity()
export class TaxPaid extends Model {
  @Column({ type: "numeric", precision: 19, scale: 0 })
  import: number;

  @Column()
  date: Date;

  @ManyToOne(() => Profile)
  @JoinColumn()
  profile: Profile;

  @ManyToOne(() => Tax)
  @JoinColumn()
  tax: Tax;
}
