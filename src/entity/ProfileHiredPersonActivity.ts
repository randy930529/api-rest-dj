import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import Model from "./Base";
import { ProfileActivity } from "./ProfileActivity";
import { ProfileHiredPerson } from "./ProfileHiredPerson";
import { ColumnNumericTransformer } from "../utils/ColumnNumericTransformer";

@Entity()
export class ProfileHiredPersonActivity extends Model {
  @Column({
    type: "numeric",
    precision: 19,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
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
    (profileActivity) => profileActivity.profileHiredPersonActivity,
    { onDelete: "CASCADE" }
  )
  @JoinColumn()
  profileActivity: ProfileActivity;
}
