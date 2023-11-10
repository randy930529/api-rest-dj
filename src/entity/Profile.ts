import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import Model from "./Base";
import { User } from "./User";
import { ProfileHiredPerson } from "./ProfileHiredPerson";
import { HiredPerson } from "./HiredPerson";

@Entity()
export class Profile extends Model {
  @Column({ default: "" })
  nombre: string;

  @Column({ default: "" })
  last_name: string;

  @Column({ type: "varchar", length: 11, default: "" })
  ci: string;

  @Column({ type: "varchar", length: 20, nullable: true, default: "" })
  nit: string;

  @Column({ nullable: true })
  address: string;

  @Column({ default: false })
  primary: boolean;

  @Column({ default: false })
  current: boolean;

  @ManyToOne(() => User, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  user: User;

  @OneToMany(
    () => ProfileHiredPerson,
    (profileHiredPerson) => profileHiredPerson.profile
  )
  profileHiredPerson: ProfileHiredPerson[];

  @OneToMany(() => HiredPerson, (profile) => profile.profile)
  hiredPerson: HiredPerson[];
}
