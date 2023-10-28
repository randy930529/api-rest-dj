import { ExpenseElementController } from "../controller/ExpenseElementController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

export const expenseElementRoutes = [
  {
    method: "post",
    route: "/expense/element",
    controller: ExpenseElementController,
    middlewares: [authMiddleware],
    action: "createExpenseElement",
  },
  {
    method: "get",
    route: "/expense/elements",
    controller: ExpenseElementController,
    middlewares: [authMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/expense/element/:id",
    controller: ExpenseElementController,
    middlewares: [authMiddleware],
    action: "onExpenseElement",
  },
  {
    method: "put",
    route: "/expense/element",
    controller: ExpenseElementController,
    middlewares: [authMiddleware],
    action: "updateExpenseElement",
  },
  {
    method: "patch",
    route: "/expense/element",
    controller: ExpenseElementController,
    middlewares: [authMiddleware],
    action: "partialUpdateExpenseElement",
  },
  {
    method: "delete",
    route: "/expense/element/:id",
    controller: ExpenseElementController,
    middlewares: [authMiddleware],
    action: "deleteExpenseElement",
  },
];
