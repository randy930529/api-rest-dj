import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";

@Entity()
export class FiscalYear extends Model {
  @Column({ type: "integer", width: 4 })
  year: number;

  @Column({ default: false })
  general_scheme: boolean;

  @OneToOne(() => Profile)
  @JoinColumn()
  profile: Profile;
}
