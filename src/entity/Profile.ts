import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import Model from "./Base";
import { User } from "./User";
import { ProfileHiredPerson } from "./ProfileHiredPerson";

@Entity()
export class Profile extends Model {
  @Column()
  nombre: string;

  @Column()
  last_name: string;

  @Column({ type: "varchar", length: 11 })
  ci: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  nit: string;

  @Column({ nullable: true })
  address: string;

  @Column({ default: false })
  primary: boolean;

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
}
