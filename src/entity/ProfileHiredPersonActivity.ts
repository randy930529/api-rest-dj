import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import Model from "./Base";
import { ProfileActivity } from "./ProfileActivity";
import { ProfileHiredPerson } from "./ProfileHiredPerson";

@Entity()
export class ProfileHiredPersonActivity extends Model {
  @Column()
  annual_cost: number;

  @ManyToOne(
    () => ProfileHiredPerson,
    (profileHiredPerson) => profileHiredPerson.profileHiredPersonActivity,
    {
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    }
  )
  @JoinColumn()
  profileHiredPerson: ProfileHiredPerson;

  @ManyToOne(
    () => ProfileActivity,
    (profileActivity) => profileActivity.profileHiredPersonActivity
  )
  @JoinColumn()
  profileActivity: ProfileActivity;

  @AfterInsert()
  @AfterUpdate()
  @AfterRemove()
  async updateProfileHiredPersonImport() {
    const totalCost = (
      await ProfileHiredPerson.findOne({
        select: { profileHiredPersonActivity: { annual_cost: true } },
        relations: ["profileHiredPersonActivity"],
        where: { id: this.profileHiredPerson.id },
      })
    )?.profileHiredPersonActivity.reduce(
      (acc, cost) => acc + cost.annual_cost,
      0
    );
    console.log(totalCost);
    this.profileHiredPerson.import = totalCost;
    await this.profileHiredPerson.save();
  }
}
