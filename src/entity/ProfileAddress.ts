import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import Model from "./Base";
import { Address } from "./Address";

@Entity()
export class ProfileAddress extends Model {
  @Column({ type: "varchar", length: 255, nullable: true, default: "" })
  street: string;

  @Column({ type: "varchar", length: 4, nullable: true, default: "" })
  number: string;

  @Column({ type: "varchar", length: 100, nullable: true, default: "" })
  apartment: string;

  @Column({ type: "varchar", length: 255, nullable: true, default: "" })
  betweenStreets: string;

  @Column({ type: "varchar", length: 255, nullable: true, default: "" })
  ref: string;

  @Column({ type: "varchar", length: 255, nullable: true, default: "" })
  district: string;

  @Column({ type: "varchar", length: 5, nullable: true, default: "" })
  postcode: string;

  @Column({ type: "varchar", length: 8, nullable: true, default: "" })
  phoneNumber: string;

  @ManyToOne(() => Address, { cascade: ["update"] })
  @JoinColumn()
  address: Address;

  toString() {
    return `Call. ${this.street} #${this.number}, Apto. ${this.apartment}, %${this.betweenStreets}, ${this.ref}, ${this.address.municipality}, ${this.address.province}`;
  }
}
