import { VoucherDetailController } from "../controller/VoucherDetailController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

export const voucherDetailRoutes = [
  {
    method: "post",
    route: "/voucher/detail",
    controller: VoucherDetailController,
    middlewares: [authMiddleware],
    action: "createVoucherDetail",
  },
  {
    method: "get",
    route: "/voucher/details",
    controller: VoucherDetailController,
    middlewares: [authMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/voucher/detail/:id",
    controller: VoucherDetailController,
    middlewares: [authMiddleware],
    action: "onVoucherDetail",
  },
  {
    method: "put",
    route: "/voucher/detail",
    controller: VoucherDetailController,
    middlewares: [authMiddleware],
    action: "updateVoucherDetail",
  },
  {
    method: "patch",
    route: "/voucher/detail",
    controller: VoucherDetailController,
    middlewares: [authMiddleware],
    action: "partialUpdateVoucherDetail",
  },
  {
    method: "delete",
    route: "/voucher/detail/:id",
    controller: VoucherDetailController,
    middlewares: [authMiddleware],
    action: "deleteVoucherDetail",
  },
];
