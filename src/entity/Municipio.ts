import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import Model from "./Base";
import { Provincia } from "./Provincia";
import { HiredPerson } from "./HiredPerson";

@Entity()
export class Municipio extends Model {
  @Column({ type: "varchar", length: 100 })
  description: string;

  @Column({ type: "varchar", length: 6 })
  code: string;

  @ManyToOne(() => Provincia)
  @JoinColumn()
  provincia: Provincia;

  @OneToMany(() => HiredPerson, (hiredPerson) => hiredPerson.municipio)
  hiredPerson: HiredPerson[];
}
