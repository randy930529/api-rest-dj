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
}
