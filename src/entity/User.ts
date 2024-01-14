import { Entity, Column, OneToMany, Index } from "typeorm";
import { RefreshToken } from "./RefreshToken";
import Model from "./Base";
import { LicenseUser } from "./LicenseUser";
import { Profile } from "./Profile";

export enum UserRole {
  ADMIN = "admin",
  EDITOR = "editor",
  GHOST = "cliente",
}

@Entity()
export class User extends Model {
  @Index("email_index")
  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  active: boolean;

  @Column({ nullable: true })
  register_date: Date;

  @Column({ nullable: true })
  password_update_date: Date;

  @Column({ nullable: true })
  end_license: Date;

  @Column({ type: "integer", width: 4, default: 1 })
  max_profiles: number;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.GHOST,
  })
  role: UserRole;

  @OneToMany(() => RefreshToken, (refreshTokens) => refreshTokens.user, {
    onDelete: "CASCADE",
  })
  refresh_tokens: RefreshToken;

  @OneToMany(() => LicenseUser, (licenseUser) => licenseUser.user, {
    onDelete: "CASCADE",
  })
  licenseUser: LicenseUser[];

  @OneToMany(() => Profile, (profile) => profile.user)
  profiles: Profile[];

  toJSON() {
    return {
      ...this,
      password: undefined,
      active: undefined,
      created_at: undefined,
      updated_at: undefined,
    };
  }
}
