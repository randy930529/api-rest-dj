import { Entity, Column, OneToMany, BeforeRemove } from "typeorm";
import { HiredPerson } from "./HiredPerson";
import Model from "./Base";
import { ProfileAddress } from "./ProfileAddress";

@Entity()
export class Address extends Model {
  @Column()
  residence: string;

  @Column({ type: "varchar", length: 50, default: "" })
  municipality: string;

  @Column({ type: "varchar", length: 50, default: "" })
  province: string;

  @Column({ type: "varchar", length: 6, default: "" })
  code: string;

  @OneToMany(() => HiredPerson, (hiredPerson) => hiredPerson.address, {
    onDelete: "CASCADE",
  })
  hiredPerson: HiredPerson[];

  @OneToMany(() => ProfileAddress, (profileAddress) => profileAddress.address, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  profileAddress: ProfileAddress[];
}
