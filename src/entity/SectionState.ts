import { Entity, JoinColumn, OneToOne } from "typeorm";
import Model from "./Base";
import { User } from "./User";
import { Profile } from "./Profile";
import { FiscalYear } from "./FiscalYear";

@Entity()
export class SectionState extends Model {
  @OneToOne(() => User, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  user: User;

  @OneToOne(() => Profile)
  @JoinColumn()
  profile: Profile;

  @OneToOne(() => FiscalYear)
  @JoinColumn()
  fiscalYear: FiscalYear;
}