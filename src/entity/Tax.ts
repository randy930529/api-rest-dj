import { Entity, Column, OneToMany } from "typeorm";
import Model from "./Base";
import { SupportDocument } from "./SupportDocument";

@Entity()
export class Tax extends Model {
  @Column({ type: "varchar", length: 255 })
  description: string;

  @Column({ nullable: true })
  code: string;

  @Column({ default: false })
  active: boolean;

  @OneToMany(() => SupportDocument, (supportDocument) => supportDocument.tax)
  supportDocument: SupportDocument[];
}
