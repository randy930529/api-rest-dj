import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";
import { FiscalYear } from "./FiscalYear";
import { Dj08SectionData } from "./Dj08SectionData";

@Entity()
export class DJ08 extends Model {
  @ManyToOne(() => Profile)
  @JoinColumn()
  profile: Profile;

  @ManyToOne(() => FiscalYear)
  @JoinColumn()
  fiscalYear: FiscalYear;

  @OneToMany(() => Dj08SectionData, (dj08SectionData) => dj08SectionData.dJ08, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  dj08SectionData: Dj08SectionData[];
}
