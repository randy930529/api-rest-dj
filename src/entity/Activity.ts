import { Column, Entity, OneToMany } from "typeorm";
import Model from "./Base";
import { ProfileActivity } from "./ProfileActivity";

@Entity()
export class Activity extends Model {
  @Column()
  description: string;

  @Column({ type: "varchar", length: 4 })
  code: string;

  @Column({ default: false })
  is_culture: boolean;

  @OneToMany(
    () => ProfileActivity,
    (profileActivity) => profileActivity.activity
  )
  profileActivity: ProfileActivity[];
}
