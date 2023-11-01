import { TaxPaidController } from "../controller/TaxPaidController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

export const TaxPaidRoutes = [
  {
    method: "post",
    route: "/tax/paid",
    controller: TaxPaidController,
    middlewares: [authMiddleware],
    action: "createTaxPaid",
  },
  {
    method: "get",
    route: "/taxes/paid",
    controller: TaxPaidController,
    middlewares: [authMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/tax/paid/:id",
    controller: TaxPaidController,
    middlewares: [authMiddleware],
    action: "onTaxPaid",
  },
  {
    method: "put",
    route: "/tax/paid",
    controller: TaxPaidController,
    middlewares: [authMiddleware],
    action: "updateTaxPaid",
  },
  {
    method: "patch",
    route: "/tax/paid",
    controller: TaxPaidController,
    middlewares: [authMiddleware],
    action: "partialUpdateTaxPaid",
  },
  {
    method: "delete",
    route: "/tax/paid/:id",
    controller: TaxPaidController,
    middlewares: [authMiddleware],
    action: "deleteTaxPaid",
  },
];
