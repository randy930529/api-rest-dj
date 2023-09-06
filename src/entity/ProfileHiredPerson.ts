import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import Model from "./Base";
import { HiredPerson } from "./HiredPerson";
import { Profile } from "./Profile";

@Entity()
export class ProfileHiredPerson extends Model {
  @Column({ type: "time", precision: 7 })
  date_start: string;

  @Column({ type: "time", precision: 7 })
  date_end: string;

  @Column({ type: "numeric", precision: 19, scale: 0 })
  import: number;

  @OneToOne(() => Profile)
  @JoinColumn()
  profile: Profile;

  @OneToOne(() => HiredPerson)
  @JoinColumn()
  hiredPerson: HiredPerson;
}
