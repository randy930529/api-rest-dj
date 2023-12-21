import { Entity, Column, OneToMany } from "typeorm";
import Model from "./Base";
import { LicenseUser } from "./LicenseUser";

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

  @Column()
  import: number;

  @OneToMany(() => LicenseUser, (licenseUser) => licenseUser.license)
  licenseUser: LicenseUser[];
}
