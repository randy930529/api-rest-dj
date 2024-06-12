import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import Model from "./Base";
import { DJ08 } from "./DJ08";

export enum SectionName {
  SECTION_A = 1,
  SECTION_B = 2,
  SECTION_C = 3,
  SECTION_D = 4,
  SECTION_E = 5,
  SECTION_F = 6,
  SECTION_G = 7,
  SECTION_H = 8,
  SECTION_I = 9,
}

@Entity()
export class Dj08SectionData extends Model {
  @Column({ default: true })
  is_rectification: boolean;

  @Column({
    type: "json",
    nullable: true,
  })
  section_data: string;

  @ManyToOne(() => DJ08, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn()
  dJ08: DJ08;

  toJSON() {
    return {
      ...this,
      created_at: undefined,
      updated_at: undefined,
    };
  }
}
