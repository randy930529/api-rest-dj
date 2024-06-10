import { Entity, Column, OneToMany, Index, BeforeRemove } from "typeorm";
import { RefreshToken } from "./RefreshToken";
import Model from "./Base";
import { LicenseUser } from "./LicenseUser";
import { Profile } from "./Profile";
import { Enterprise } from "./Enterprise";

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
    cascade: true,
  })
  licenseUser: LicenseUser[];

  @OneToMany(() => Profile, (profile) => profile.user)
  profiles: Profile[];

  @OneToMany(() => Enterprise, (enterprise) => enterprise.user, {
    onDelete: "CASCADE",
  })
  enterprise: Enterprise[];

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
