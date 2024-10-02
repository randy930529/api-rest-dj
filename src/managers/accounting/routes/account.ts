import { AccountController } from "../controller/AccountController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";
import { userMiddleware } from "../../../auth/middlewares/userMiddleware";
import { isAdminMiddleware } from "../../../auth/middlewares/isAdminMiddleware";

export const accountRoutes = [
  {
    method: "post",
    route: "/account",
    controller: AccountController,
    middlewares: [authMiddleware, userMiddleware, isAdminMiddleware],
    action: "createAccount",
  },
  {
    method: "get",
    route: "/accounts",
    controller: AccountController,
    middlewares: [authMiddleware, userMiddleware, isAdminMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/account/:id",
    controller: AccountController,
    middlewares: [authMiddleware, userMiddleware, isAdminMiddleware],
    action: "onAccount",
  },
  {
    method: "put",
    route: "/account",
    controller: AccountController,
    middlewares: [authMiddleware, userMiddleware, isAdminMiddleware],
    action: "updateAccount",
  },
  {
    method: "delete",
    route: "/account/:id",
    controller: AccountController,
    middlewares: [authMiddleware, userMiddleware, isAdminMiddleware],
    action: "deleteAccount",
  },
];
