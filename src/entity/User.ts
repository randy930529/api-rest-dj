import { Entity, Column, OneToMany, Index } from "typeorm";
import { RefreshToken } from "./RefreshToken";
import Model from "./Base";

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

  @OneToMany((type) => RefreshToken, (refreshTokens) => refreshTokens.user, {
    onDelete: "CASCADE",
  })
  refresh_tokens: RefreshToken;

  toJSON() {
    return { ...this, password: undefined, active: undefined };
  }
}
