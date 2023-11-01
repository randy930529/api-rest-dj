import { TaxController } from "../controller/TaxController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

export const taxRoutes = [
  {
    method: "post",
    route: "/tax",
    controller: TaxController,
    middlewares: [authMiddleware],
    action: "createTax",
  },
  {
    method: "get",
    route: "/taxes",
    controller: TaxController,
    middlewares: [authMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/tax/:id",
    controller: TaxController,
    middlewares: [authMiddleware],
    action: "onTax",
  },
  {
    method: "put",
    route: "/tax",
    controller: TaxController,
    middlewares: [authMiddleware],
    action: "updateTax",
  },
  {
    method: "patch",
    route: "/tax",
    controller: TaxController,
    middlewares: [authMiddleware],
    action: "partialUpdateTax",
  },
  {
    method: "delete",
    route: "/tax/:id",
    controller: TaxController,
    middlewares: [authMiddleware],
    action: "deleteTax",
  },
];
