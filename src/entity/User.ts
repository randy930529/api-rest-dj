import { Entity, Column, OneToMany, Index, OneToOne } from "typeorm";
import { RefreshToken } from "./RefreshToken";
import Model from "./Base";
import { Profile } from "./Profile";

export enum UserRole {
  ADMIN = "admin",
  EDITOR = "editor",
  GHOST = "ghost",
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
  password_update_date: Date;

  @Column({ nullable: true })
  end_license: Date;

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

  @OneToOne(() => Profile, (profile) => profile.user, {
    onDelete: "CASCADE",
  })
  profile: Profile;

  toJSON() {
    return { ...this, password: undefined, active: undefined };
  }
}
