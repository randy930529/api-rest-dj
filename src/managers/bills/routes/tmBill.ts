import { TMBillController } from "../controller/TMBillController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";
import { userMiddleware } from "../../../auth/middlewares/userMiddleware";
import { isAdminMiddleware } from "../../../auth/middlewares/isAdminMiddleware";

export const tmBillRoutes = [
  // {
  //   method: "post",
  //   route: "/tmBill",
  //   controller: TMBillController,
  //   middlewares: [authMiddleware],
  //   action: "createTMBill",
  // },
  {
    method: "get",
    route: "/tmBills",
    controller: TMBillController,
    middlewares: [authMiddleware, userMiddleware, isAdminMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/tmBill/:id",
    controller: TMBillController,
    middlewares: [authMiddleware],
    action: "on",
  },
  // {
  //   method: "put",
  //   route: "/tmBill",
  //   controller: TMBillController,
  //   middlewares: [authMiddleware],
  //   action: "updateTMBill",
  // },
  // {
  //   method: "patch",
  //   route: "/tmBill",
  //   controller: TMBillController,
  //   middlewares: [authMiddleware],
  //   action: "partialUpdate",
  // },
  // {
  //   method: "delete",
  //   route: "/tmBill/:id",
  //   controller: TMBillController,
  //   middlewares: [authMiddleware],
  //   action: "deleteTMBill",
  // },
];
