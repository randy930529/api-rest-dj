import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import Model from "./Base";
import { ColumnNumericTransformer } from "../utils/ColumnNumericTransformer";
import { Enterprise } from "./Enterprise";
import { Profile } from "./Profile";

@Entity()
export class ProfileEnterprise extends Model {
  @Column({
    type: "numeric",
    precision: 19,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column({
    type: "numeric",
    precision: 19,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  import: number;

  @ManyToOne(() => Enterprise)
  @JoinColumn()
  enterprise: Enterprise;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn()
  profile: Profile;
}
