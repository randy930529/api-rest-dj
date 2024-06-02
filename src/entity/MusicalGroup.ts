import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import Model from "./Base";
import { FiscalYear } from "./FiscalYear";

@Entity()
export class MusicalGroup extends Model {
  @Column()
  description: string;

  @Column()
  number_members: number;

  @OneToOne(() => FiscalYear, fiscalYear => fiscalYear.musicalGroup, {
    onDelete:"CASCADE",
    onUpdate:"CASCADE"
  })
  fiscalYear: FiscalYear;
}
