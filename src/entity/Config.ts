import { Column, Entity } from "typeorm";
import Model from "./Base";
import { appConfig } from "../../config";
import { ColumnNumericTransformer } from "../utils/ColumnNumericTransformer";

@Entity()
export class Config extends Model {
  @Column({ default: appConfig.emailFrom ?? "" })
  email_from: string;

  @Column({ default: appConfig.licenseFreeDays ?? 0 })
  license_free_days: number;

  @Column({ default: appConfig.businessMetadata.name })
  business_name: string;

  @Column({ default: appConfig.businessMetadata.source })
  business_source: number;

  @Column({ default: appConfig.businessMetadata.address })
  business_address: string;

  @Column({ default: appConfig.businessMetadata.phone })
  business_phone: string;

  @Column({ default: appConfig.businessMetadata.email })
  business_email: string;

  @Column({
    type: "numeric",
    precision: 19,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
    default: appConfig.accountingConstants.MEa_By_MFP ?? 0,
  })
  MEa_By_MFP: number;

  @Column({
    type: "numeric",
    precision: 3,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
    default: appConfig.accountingConstants.PPD_PERCENTAGE ?? 1,
  })
  PPD_PERCENTAGE: number;

  @Column({
    type: "numeric",
    precision: 3,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
    default: appConfig.accountingConstants.PE_0_10000 ?? 1,
  })
  PE_0_10000: number;

  @Column({
    type: "numeric",
    precision: 3,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
    default: appConfig.accountingConstants.PE_10000_20000 ?? 1,
  })
  PE_10000_20000: number;

  @Column({
    type: "numeric",
    precision: 3,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
    default: appConfig.accountingConstants.PE_20000_30000 ?? 1,
  })
  PE_20000_30000: number;

  @Column({
    type: "numeric",
    precision: 3,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
    default: appConfig.accountingConstants.PE_30000_50000 ?? 1,
  })
  PE_30000_50000: number;

  @Column({
    type: "numeric",
    precision: 3,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
    default: appConfig.accountingConstants.PE_ABOVE_50000 ?? 1,
  })
  PE_ABOVE_50000: number;
}
