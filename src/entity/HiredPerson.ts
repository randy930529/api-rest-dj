import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";
import { ProfileHiredPerson } from "./ProfileHiredPerson";

@Entity()
export class HiredPerson extends Model {
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255 })
  last_name: string;

  @Column({ type: "varchar", length: 11 })
  ci: string;

  @ManyToOne(() => Profile)
  @JoinColumn()
  profile: Profile;

  @OneToMany(
    () => ProfileHiredPerson,
    (profileHiredPerson) => profileHiredPerson.hiredPerson
  )
  profileHiredPerson: ProfileHiredPerson[];
}