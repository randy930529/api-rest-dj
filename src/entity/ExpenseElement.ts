import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";

@Entity()
export class ExpenseElement extends Model {
  @Column({ type: "varchar", length: 100 })
  description: string;

  @Column({ type: "char", length: 1 })
  type: string;

  @Column({ default: false })
  active: boolean;

  @Column({ default: false })
  is_general: boolean;

  @OneToOne(() => Profile)
  @JoinColumn()
  profile: Profile;
}
