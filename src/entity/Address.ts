import { Entity, Column, OneToMany, BeforeRemove } from "typeorm";
import { HiredPerson } from "./HiredPerson";
import Model from "./Base";

@Entity()
export class Address extends Model {
  @Column()
  residence: string;

  @Column({ type: "varchar", length: 50, default: "" })
  municipality: string;

  @Column({ type: "varchar", length: 50, default: "" })
  province: string;

  @Column({ type: "varchar", length: 6 })
  code: string;

  @OneToMany(() => HiredPerson, (hiredPerson) => hiredPerson.address)
  hiredPerson: HiredPerson[];
}
