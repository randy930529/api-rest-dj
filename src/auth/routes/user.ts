import { UserController } from "../controller/UserController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { nextFunction } from "../middlewares/nextMiddleware";

export const userRoutes = [
  {
    method: "get",
    route: "/users",
    controller: UserController,
    middlewares: [authMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/users/:id",
    controller: UserController,
    middlewares: [nextFunction],
    action: "one",
  },
  {
    method: "post",
    route: "/users",
    controller: UserController,
    middlewares: [nextFunction],
    action: "save",
  },
  {
    method: "delete",
    route: "/user/:id",
    controller: UserController,
    middlewares: [authMiddleware],
    action: "remove",
  },
  {
    method: "get",
    route: "/user/me",
    controller: UserController,
    middlewares: [nextFunction],
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
