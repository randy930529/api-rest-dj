import { ProfileController } from "../controller/ProfileController";
import { authMiddleware } from "../middlewares/authMiddleware";

export const profileRoutes = [
  {
    method: "post",
    route: "/perfile",
    controller: ProfileController,
    middlewares: [authMiddleware],
    action: "create",
  },
  {
    method: "get",
    route: "/perfiles",
    controller: ProfileController,
    middlewares: [authMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/perfile/:id",
    controller: ProfileController,
    middlewares: [authMiddleware],
    action: "on",
  },
  {
    method: "put",
    route: "/perfile",
    controller: ProfileController,
    middlewares: [authMiddleware],
    action: "update",
  },
  {
    method: "delete",
    route: "/perfile",
    controller: ProfileController,
    middlewares: [authMiddleware],
    action: "delete",
  },
];
