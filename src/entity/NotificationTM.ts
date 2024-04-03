import { PrimaryGeneratedColumn, BaseEntity, Column, Entity } from "typeorm";

export enum NotiType {
  RES = "orden_de_pago",
  REQ = "notificacion_por_pago",
}

@Entity()
export class NotificationTM extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "enum",
    enum: NotiType,
    default: NotiType.REQ,
  })
  type: NotiType;

  @Column({ default: "", nullable: true })
  body: string;

  @Column({ default: "", nullable: true })
  header: string;
}
