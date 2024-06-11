import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import Model from "./Base";
import { Address } from "./Address";
import { Profile } from "./Profile";

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

  @ManyToOne(() => Address, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn()
  address: Address;

  @OneToMany(() => Profile, (profile) => profile.address, {
    cascade: true,
  })
  profiles: Profile[];

  toString() {
    return `Call. ${this.street} #${this.number}, Apto. ${this.apartment}, %${this.betweenStreets}, ${this.ref}, ${this.address.municipality}, ${this.address.province}`;
  }

  toJSON() {
    return {
      ...this,
      address: undefined,
      code: this.address?.code,
      municipality: this.address?.municipality,
      province: this.address?.province,
    };
  }
}
