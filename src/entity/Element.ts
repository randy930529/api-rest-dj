import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";
import { Account } from "./Account";
import { SupportDocument } from "./SupportDocument";

@Entity()
export class Element extends Model {
  @Column({ type: "varchar", length: 100 })
  description: string;

  @Column({ type: "char", length: 1 })
  type: string;

  @Column({ default: false })
  active: boolean;

  @Column({ default: false })
  is_general: boolean;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn()
  profile: Profile;

  @ManyToOne(() => Account)
  @JoinColumn()
  account: Account;

  @OneToMany(
    () => SupportDocument,
    (supportDocument) => supportDocument.element
  )
  supportDocuments: SupportDocument[];
}
