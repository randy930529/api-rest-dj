import { Column, Entity } from "typeorm";
import Model from "./Base";

export enum NotiType {
  RES = "orden_de_pago",
  REQ = "notificacion_por_pago",
}

@Entity()
export class NotificationTM extends Model {
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
