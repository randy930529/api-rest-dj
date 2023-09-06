import { Entity, Column, JoinColumn, ManyToOne } from "typeorm";
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

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn()
  profile: Profile;
}
