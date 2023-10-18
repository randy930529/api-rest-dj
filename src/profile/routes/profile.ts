import { ProfileController } from "../controller/ProfileController";
import { authMiddleware } from "../../auth/middlewares/authMiddleware";
import { isAdminMiddleware } from "../../auth/middlewares/isAdminMiddleware";

export const profileRoutes = [
  {
    method: "post",
    route: "/profile",
    controller: ProfileController,
    middlewares: [authMiddleware],
    action: "create",
  },
  {
    method: "get",
    route: "/profiles",
    controller: ProfileController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/profile/:id",
    controller: ProfileController,
    middlewares: [authMiddleware],
    action: "on",
  },
  {
    method: "put",
    route: "/profile",
    controller: ProfileController,
    middlewares: [authMiddleware],
    action: "update",
  },
  {
    method: "patch",
    route: "/profile",
    controller: ProfileController,
    middlewares: [authMiddleware],
    action: "partialUpdate",
  },
  {
    method: "delete",
    route: "/profile/:id",
    controller: ProfileController,
    middlewares: [authMiddleware],
    action: "delete",
  },
];
