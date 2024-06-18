import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
  BeforeInsert,
} from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";
import { Account } from "./Account";
import { SupportDocument } from "./SupportDocument";

@Entity()
export class Element extends Model {
  @Column({ type: "varchar", length: 100 })
  description: string;

  @Column({ type: "char", length: 4, default:"" })
  type: string;

  @Column({ default: false })
  active: boolean;

  @Column({ default: false })
  is_general: boolean;

  @Column({ type: "char", length: 10, default: "" })
  group: string;

  @Column({ nullable: true })
  help: string;

  @ManyToOne(() => Profile, { nullable: true, cascade: ["remove"] })
  @JoinColumn()
  profile: Profile;

  @ManyToOne(() => Account)
  @JoinColumn()
  account: Account;

  @OneToMany(
    () => SupportDocument,
    (supportDocument) => supportDocument.element,
    { cascade: ["remove"] }
  )
  supportDocuments: SupportDocument[];

  @BeforeInsert()
  async checkDuplicateElementForProfile(): Promise<void> {
    const elementForProfileWithSameName = await Element.findOne({
      where: {
        profile: { id: this.profile?.id },
        description: this.description,
        type: this.type,
      },
    });

    if (
      elementForProfileWithSameName &&
      this.id != elementForProfileWithSameName.id
    ) {
      throw new Error("Only a element with the same name are allowed.");
    }

    if (
      (this.type === "g" && this.group.trim() === "pd") ||
      this.group.trim() === "dd"
    ) {
      const allowedCount = this.group.trim() === "pd" ? 6 : 2;
      const countElementsForProfilePD = await Element.count({
        where: {
          profile: { id: this.profile?.id },
          type: this.type,
          group: this.group,
        },
      });

      if (!this.is_general && countElementsForProfilePD >= allowedCount) {
        throw new Error(
          `Only ${allowedCount} possible elements to deduce are allowed.`
        );
      }
    }
  }
}
