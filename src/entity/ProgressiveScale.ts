import {
  BeforeInsert,
  Column,
  Entity,
  IsNull,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import Model from "./Base";
import { Config } from "./Config";
import { ColumnNumericTransformer } from "../utils/ColumnNumericTransformer";

@Entity()
export class ProgressiveScale extends Model {
  @Column({ default: true })
  is_normal: boolean;

  @Column({ type: "integer", width: 2, default: -1 })
  tramo: number;

  @Column({
    type: "numeric",
    precision: 19,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
    default: 0,
  })
  from: number;

  @Column({
    type: "numeric",
    precision: 19,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
    default: 0,
  })
  to: number;

  @Column({ type: "integer", width: 4 })
  porcentage: number;

  @ManyToOne(() => Config, {
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn()
  config: Config;

  @BeforeInsert()
  async clean(): Promise<void> {
    await ProgressiveScale.remove(
      await ProgressiveScale.findBy({ config: IsNull() })
    );
  }
}
