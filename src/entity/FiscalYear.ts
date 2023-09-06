import { Entity, Column, JoinColumn, ManyToOne } from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";

@Entity()
export class FiscalYear extends Model {
  @Column({ type: "integer", width: 4 })
  year: number;

  @Column({ default: false })
  general_scheme: boolean;

  @ManyToOne(() => Profile)
  @JoinColumn()
  profile: Profile;
}
