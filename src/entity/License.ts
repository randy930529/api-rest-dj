import { Entity, Column, OneToMany } from "typeorm";
import Model from "./Base";
import { LicenseUser } from "./LicenseUser";
import { ColumnNumericTransformer } from "../utils/ColumnNumericTransformer";

@Entity()
export class License extends Model {
  @Column({ default: "" })
  name: string;

  @Column({ type: "integer", width: 4 })
  days: number;

  @Column({ type: "integer", width: 4 })
  max_profiles: number;

  @Column({ default: false })
  active: boolean;

  @Column({ default: false })
  public: boolean;

  @Column({
    type: "numeric",
    precision: 19,
    scale: 0,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  import: number;

  @Column({ type: "integer", width: 2, nullable: true })
  order: number;

  @OneToMany(() => LicenseUser, (licenseUser) => licenseUser.license)
  licenseUser: LicenseUser[];
}
