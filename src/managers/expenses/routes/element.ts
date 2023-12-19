import { ElementController } from "../controller/ElementController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

export const elementRoutes = [
  {
    method: "post",
    route: "/expense/element",
    controller: ElementController,
    middlewares: [authMiddleware],
    action: "createExpenseElement",
  },
  {
    method: "get",
    route: "/expense/elements",
    controller: ElementController,
    middlewares: [authMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/expense/element/:id",
    controller: ElementController,
    middlewares: [authMiddleware],
    action: "onExpenseElement",
  },
  {
    method: "put",
    route: "/expense/element",
    controller: ElementController,
    middlewares: [authMiddleware],
    action: "updateExpenseElement",
  },
  {
    method: "patch",
    route: "/expense/element",
    controller: ElementController,
    middlewares: [authMiddleware],
    action: "partialUpdateExpenseElement",
  },
  {
    method: "delete",
    route: "/expense/element/:id",
    controller: ElementController,
    middlewares: [authMiddleware],
    action: "deleteExpenseElement",
  },
];
