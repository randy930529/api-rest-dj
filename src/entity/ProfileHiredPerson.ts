import { Entity, Column, JoinColumn, ManyToOne } from "typeorm";
import Model from "./Base";
import { HiredPerson } from "./HiredPerson";
import { Profile } from "./Profile";
import { ColumnNumericTransformer } from "../utils/ColumnNumericTransformer";

@Entity()
export class ProfileHiredPerson extends Model {
  @Column()
  date_start: Date;

  @Column()
  date_end: Date;

  @Column({
    type: "numeric",
    precision: 19,
    scale: 4,
    transformer: new ColumnNumericTransformer(),
  })
  import: number;

  @ManyToOne(() => Profile)
  @JoinColumn()
  profile: Profile;

  @ManyToOne(() => HiredPerson)
  @JoinColumn()
  hiredPerson: HiredPerson;
}
