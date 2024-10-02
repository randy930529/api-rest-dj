import { VoucherController } from "../controller/VoucherController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

export const voucherRoutes = [
  {
    method: "post",
    route: "/voucher",
    controller: VoucherController,
    middlewares: [authMiddleware],
    action: "createVoucher",
  },
  {
    method: "get",
    route: "/vouchers",
    controller: VoucherController,
    middlewares: [authMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/voucher/:id",
    controller: VoucherController,
    middlewares: [authMiddleware],
    action: "onVoucher",
  },
  {
    method: "put",
    route: "/voucher",
    controller: VoucherController,
    middlewares: [authMiddleware],
    action: "updateVoucher",
  },
  {
    method: "patch",
    route: "/voucher",
    controller: VoucherController,
    middlewares: [authMiddleware],
    action: "partialUpdateVoucher",
  },
  {
    method: "delete",
    route: "/voucher/:id",
    controller: VoucherController,
    middlewares: [authMiddleware],
    action: "deleteVoucher",
  },
];
