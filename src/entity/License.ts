import { Entity, Column } from "typeorm";
import Model from "./Base";

@Entity()
export class License extends Model {
  @Column({ type: "integer", width: 4 })
  days: number;

  @Column({ type: "integer", width: 4 })
  max_profiles: number;

  @Column({ default: false })
  active: boolean;

  @Column()
  import: number;
}
