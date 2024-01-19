import { nextFunction } from "../../../auth/middlewares/nextMiddleware";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";
import { userMiddleware } from "../../../auth/middlewares/userMiddleware";
import { isAdminMiddleware } from "../../../auth/middlewares/isAdminMiddleware";
import { StateTMBillController } from "../controller/StateTMBillController";

export const stateTMBillRoutes = [
  {
    method: "post",
    route: "/license/payment/notification",
    controller: StateTMBillController,
    middlewares: [nextFunction],
    action: "licensePayOrderResult",
  },
  {
    method: "get",
    route: "/stateTMBills",
    controller: StateTMBillController,
    middlewares: [authMiddleware, userMiddleware, isAdminMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/stateTMBill/:id",
    controller: StateTMBillController,
    middlewares: [authMiddleware],
    action: "on",
  },
  // {
  //   method: "put",
  //   route: "/stateTMBill",
  //   controller: TMBillController,
  //   middlewares: [authMiddleware],
  //   action: "updateTMBill",
  // },
  // {
  //   method: "patch",
  //   route: "/stateTMBill",
  //   controller: TMBillController,
  //   middlewares: [authMiddleware],
  //   action: "partialUpdate",
  // },
  // {
  //   method: "delete",
  //   route: "/stateTMBill/:id",
  //   controller: TMBillController,
  //   middlewares: [authMiddleware],
  //   action: "deleteTMBill",
  // },
];
