import { Entity, Column, OneToMany, BeforeInsert, BeforeUpdate } from "typeorm";
import * as moment from "moment";
import Model from "./Base";
import { LicenseUser } from "./LicenseUser";
import { ColumnNumericTransformer } from "../utils/ColumnNumericTransformer";

@Entity()
export class License extends Model {
  @Column({ default: "" })
  name: string;

  @Column({ type: "integer", width: 4 })
  days: number;

  @Column({ type: "integer", width: 4 })
  max_profiles: number;

  @Column({ default: false })
  active: boolean;

  @Column({ default: false })
  public: boolean;

  @Column({
    type: "numeric",
    precision: 19,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  import: number;

  @Column({ type: "integer", width: 2, nullable: true })
  order: number;

  @Column({ type: "integer", width: 4, nullable: true })
  discounts_days: number;

  @Column({ nullable: true })
  discounts_date_end: Date;

  @Column({
    type: "numeric",
    precision: 19,
    scale: 2,
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  discounts_import: number;

  @OneToMany(() => LicenseUser, (licenseUser) => licenseUser.license)
  licenseUser: LicenseUser[];

  toJSON() {
    const isEndDiscounts =
      this.discounts_date_end &&
      this.discounts_days &&
      this.discounts_import &&
      moment().isAfter(moment(this.discounts_date_end));

    if (isEndDiscounts) {
      this.discounts_date_end = null;
      this.discounts_days = null;
      this.discounts_import = null;

      License.save(this);
    }

    return {
      ...this,
      discounts_date_end: undefined,
      discounts_days: this.discounts_days || undefined,
      discounts_import: this.discounts_import || undefined,
    };
  }

  @BeforeInsert()
  @BeforeUpdate()
  async setDateAndPorcentage(): Promise<void> {
    if (this.discounts_days && this.discounts_import) {
      const { import: priceReal } = this;
      if (priceReal <= this.discounts_import)
        throw new Error("No es admitida una oferta mayor/igual que el real.");

      const setDiscountsDate =
        !this.id ||
        this.discounts_days !==
          (await License.findOneBy({ id: this.id })).discounts_days;

      if (setDiscountsDate) {
        this.discounts_date_end = moment()
          .add(this.discounts_days, "days")
          .toDate();
      }
    } else {
      this.discounts_days = null;
      this.discounts_import = null;
      this.discounts_date_end = null;
    }
  }
}
