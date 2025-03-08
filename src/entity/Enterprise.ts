import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import Model from "./Base";
import { User } from "./User";
import { FiscalYearEnterprise } from "./FiscalYearEnterprise";

@Entity()
export class Enterprise extends Model {
  @Column()
  name: string;

  @Column({ type: "varchar", length: 10 })
  sector: string;

  @Column({ default: false })
  is_general: boolean;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn()
  user: User;

  @OneToMany(
    () => FiscalYearEnterprise,
    (profileEnterprise) => profileEnterprise.amount
  )
  hiredPerson: FiscalYearEnterprise[];
}
