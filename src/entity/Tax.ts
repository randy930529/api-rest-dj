import { Entity, Column } from "typeorm";
import Model from "./Base";

@Entity()
export class Tax extends Model {
  @Column({ type: "varchar", length: 255 })
  description: string;

  @Column({ nullable: true })
  code: string;

  @Column({ default: false })
  active: boolean;
}
