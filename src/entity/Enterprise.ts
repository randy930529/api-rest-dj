import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import Model from "./Base";
import { User } from "./User";
import { ProfileEnterprise } from "./ProfileEnterprise";

@Entity()
export class Enterprise extends Model {
  @Column()
  name: string;

  @Column({ type: "varchar", length: 10 })
  sector: string;

  @Column({ default: false })
  is_general: boolean;

  @ManyToOne(() => User, { cascade: ["update"], nullable: true })
  @JoinColumn()
  user: User;

  @OneToMany(
    () => ProfileEnterprise,
    (profileEnterprise) => profileEnterprise.amount
  )
  hiredPerson: ProfileEnterprise[];
}
