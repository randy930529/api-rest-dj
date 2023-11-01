import { AccountController } from "../controller/AccountController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

export const accountRoutes = [
  {
    method: "post",
    route: "/account",
    controller: AccountController,
    middlewares: [authMiddleware],
    action: "createAccount",
  },
  {
    method: "get",
    route: "/accounts",
    controller: AccountController,
    middlewares: [authMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/account/:id",
    controller: AccountController,
    middlewares: [authMiddleware],
    action: "onAccount",
  },
  {
    method: "put",
    route: "/account",
    controller: AccountController,
    middlewares: [authMiddleware],
    action: "updateAccount",
  },
  {
    method: "patch",
    route: "/account",
    controller: AccountController,
    middlewares: [authMiddleware],
    action: "partialUpdateAccount",
  },
  {
    method: "delete",
    route: "/account/:id",
    controller: AccountController,
    middlewares: [authMiddleware],
    action: "deleteAccount",
  },
];
