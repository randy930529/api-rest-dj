import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
  BeforeRemove,
  AfterRemove,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";
import { ProfileHiredPerson } from "./ProfileHiredPerson";
import { Address } from "./Address";

let addressToRemoveRef: Address;

@Entity()
export class HiredPerson extends Model {
  @Column({ type: "varchar", length: 255 })
  first_name: string;

  @Column({ type: "varchar", length: 255 })
  last_name: string;

  @Column({ type: "varchar", length: 11 })
  ci: string;

  @ManyToOne(() => Profile, { onDelete: "CASCADE" })
  @JoinColumn()
  profile: Profile;

  @OneToMany(
    () => ProfileHiredPerson,
    (profileHiredPerson) => profileHiredPerson.hiredPerson,
    {
      onDelete: "CASCADE",
    }
  )
  profileHiredPerson: ProfileHiredPerson[];

  @ManyToOne(() => Address, { nullable: true, cascade: ["update", "remove"] })
  @JoinColumn()
  address: Address;

  @BeforeRemove()
  async saveMeAddressRef(): Promise<void> {
    const me = await HiredPerson.findOne({
      relations: ["address"],
      where: { id: this.id },
    });

    if (me.address) {
      addressToRemoveRef = me.address;
    }
  }

  @AfterRemove()
  async removeAddress(): Promise<void> {
    if (addressToRemoveRef) {
      addressToRemoveRef.remove();
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  async checkDuplicatePersonForProfile(): Promise<void> {
    if (this.ci) {
      const hiredPersonWithSameCI = await HiredPerson.findOne({
        where: { profile: { id: this.profile?.id }, ci: this.ci },
      });

      if (hiredPersonWithSameCI && this.id !== hiredPersonWithSameCI?.id) {
        throw new Error("Only a person hired with the same CI is allowed.");
      }
    }
  }
}
