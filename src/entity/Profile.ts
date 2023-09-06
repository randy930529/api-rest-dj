import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import Model from "./Base";
import { User } from "./User";

@Entity()
export class Profile extends Model {
  @Column()
  nombre: string;

  @Column()
  last_name: string;

  @Column({ type: "varchar", length: 11 })
  ci: string;

  @Column({ type: "varchar", length: 20 })
  nit: string;

  @Column()
  address: string;

  @OneToOne(() => User, (user) => user.profile, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  user: User;
}
