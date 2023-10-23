import { UserController } from "../controller/UserController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { isAdminMiddleware } from "../middlewares/isAdminMiddleware";
import { nextFunction } from "../middlewares/nextMiddleware";

export const userRoutes = [
  {
    method: "get",
    route: "/users",
    controller: UserController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/users/:id",
    controller: UserController,
    middlewares: [authMiddleware],
    action: "one",
  },
  {
    method: "post",
    route: "/users",
    controller: UserController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "save",
  },
  {
    method: "delete",
    route: "/user/:id",
    controller: UserController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "remove",
  },
  {
    method: "get",
    route: "/user/me",
    controller: UserController,
    middlewares: [authMiddleware],
    action: "userMe",
  },
  {
    method: "put",
    route: "/user/me",
    controller: UserController,
    middlewares: [authMiddleware],
    action: "userMe",
  },
  {
    method: "patch",
    route: "/user/me",
    controller: UserController,
    middlewares: [authMiddleware],
    action: "userMe",
  },
];
