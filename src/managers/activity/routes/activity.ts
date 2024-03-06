import { ActivityController } from "../controller/ActivityController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";
import { userMiddleware } from "../../../auth/middlewares/userMiddleware";
import { isAdminMiddleware } from "../../../auth/middlewares/isAdminMiddleware";

export const activityRoutes = [
  {
    method: "post",
    route: "/activity",
    controller: ActivityController,
    middlewares: [authMiddleware],
    action: "create",
  },
  {
    method: "get",
    route: "/activitys",
    controller: ActivityController,
    middlewares: [authMiddleware, userMiddleware, isAdminMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/activity/:id",
    controller: ActivityController,
    middlewares: [authMiddleware],
    action: "on",
  },
  {
    method: "put",
    route: "/activity",
    controller: ActivityController,
    middlewares: [authMiddleware],
    action: "update",
  },
  {
    method: "delete",
    route: "/activity/:id",
    controller: ActivityController,
    middlewares: [authMiddleware],
    action: "delete",
  },
];
