import { nextFunction } from "../../../auth/middlewares/nextMiddleware";
import { TestTMController } from "../controller/testTMController";

export const testTMRoutes = [
  {
    method: "post",
    route: "/RestExternalPayment.svc/payOrder",
    controller: TestTMController,
    middlewares: [nextFunction],
    action: "createPayOrder",
  },
  {
    method: "post",
    route: "/tm_compra_en_linea/action",
    controller: TestTMController,
    middlewares: [nextFunction],
    action: "tmPayInLine",
  },
  {
    method: "get",
    route: "/RestExternalPayment.svc/getStatusOrder/:ExternalId/:Source",
    controller: TestTMController,
    middlewares: [nextFunction],
    action: "getStatusOrder",
  },
];
