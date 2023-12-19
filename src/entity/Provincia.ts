import { Column, Entity, OneToMany } from "typeorm";
import Model from "./Base";
import { Municipio } from "./Municipio";

@Entity()
export class Provincia extends Model {
  @Column({ type: "varchar", length: 150 })
  description: string;

  @Column({ type: "varchar", length: 6 })
  code: string;

  @OneToMany(() => Municipio, (municipio) => municipio.provincia)
  municipios: Municipio[];
}
