import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import Model from "./Base";
import { Profile } from "./Profile";
import { Element } from "./Element";
import { Currency } from "./StateTMBill";

export enum AccountType {
  ACTIVO = "a",
  PASIVO = "p",
  PATRIMONIO = "t",
  GASTOS = "g",
  INGRESO = "i",
}
@Entity()
export class Account extends Model {
  @Column({ type: "varchar", length: 20 })
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
  moneda: Currency;

  @Column({ default: false })
  acreedor: boolean;

  @ManyToOne(() => Profile)
  @JoinColumn()
  profile: Profile;

  @OneToMany(() => Element, (element) => element.account)
  elements: Element[];
}
