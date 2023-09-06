import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";

@Entity()
export class HiredPerson extends Model {
  @Column({ type: "varchar", length: 255 })
  nombre: string;

  @Column({ type: "varchar", length: 255 })
  apellidos: string;

  @Column({ type: "varchar", length: 11 })
  ci: string;

  @OneToOne(() => Profile)
  @JoinColumn()
  profile: Profile;
}
