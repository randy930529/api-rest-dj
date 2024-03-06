import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";
import { Activity } from "./Activity";

@Entity()
export class ProfileActivity extends Model {
  @Column()
  date_start: Date;

  @Column()
  date_end: Date;

  @ManyToOne(() => Profile)
  @JoinColumn()
  profile: Profile;

  @ManyToOne(() => Activity)
  @JoinColumn()
  activity: Activity;
}
