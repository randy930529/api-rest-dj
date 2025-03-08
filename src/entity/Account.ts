import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";
import { Element } from "./Element";
import { Currency } from "./StateTMBill";
import { Mayor } from "./Mayor";

export enum AccountType {
  ACTIVO = "a",
  PASIVO = "p",
  PATRIMONIO = "t",
  GASTOS = "g",
  INGRESO = "i",
}
@Entity()
export class Account extends Model {
  @Column({ type: "varchar", length: 20, unique: true })
  code: string;

  @Column({ type: "varchar", length: 120 })
  description: string;

  @Column({
    type: "enum",
    enum: AccountType,
    default: AccountType.ACTIVO,
  })
  type: AccountType;

  @Column({ type: "enum", enum: Currency, default: Currency.CUP })
  currency: Currency;

  @Column({ default: false })
  acreedor: boolean;

  @ManyToOne(() => Profile)
  @JoinColumn()
  profile: Profile;

  @OneToMany(() => Element, (element) => element.account)
  elements: Element[];

  @OneToMany(() => Mayor, (mayor) => mayor.account)
  mayors: Mayor[];

  @BeforeInsert()
  @BeforeUpdate()
  async checkDuplicateCode(): Promise<void> {
    const existingAccount = await Account.findOneBy({ code: this.code });
    if (existingAccount)
      throw new Error("Sólo una cuenta con igual código es admitida.");
  }
}
