import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";
import { Activity } from "./Activity";
import { SupportDocument } from "./SupportDocument";

@Entity()
export class ProfileActivity extends Model {
  @Column()
  date_start: Date;

  @Column()
  date_end: Date;

  @ManyToOne(() => Profile)
  @JoinColumn()
  profile: Profile;

  @ManyToOne(() => Activity)
  @JoinColumn()
  activity: Activity;

  @OneToMany(
    () => SupportDocument,
    (supportDocument) => supportDocument.profileActivity_Activity
  )
  supportDocuments: SupportDocument[];
}
