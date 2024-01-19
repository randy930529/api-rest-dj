import { authMiddleware } from "../../auth/middlewares/authMiddleware";
import { userMiddleware } from "../../auth/middlewares/userMiddleware";
import { isAdminMiddleware } from "../../auth/middlewares/isAdminMiddleware";
import { ApiConfigController } from "../../api/controller/ApiConfigController";

export const apiConfigRoutes = [
  {
    method: "post",
    route: "/api/config",
    controller: ApiConfigController,
    middlewares: [authMiddleware, userMiddleware, isAdminMiddleware],
    action: "create",
  },
  {
    method: "get",
    route: "/api/configs",
    controller: ApiConfigController,
    middlewares: [authMiddleware, userMiddleware, isAdminMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/api/config/:id",
    controller: ApiConfigController,
    middlewares: [authMiddleware, userMiddleware, isAdminMiddleware],
    action: "on",
  },
  {
    method: "put",
    route: "/api/config",
    controller: ApiConfigController,
    middlewares: [authMiddleware, userMiddleware, isAdminMiddleware],
    action: "updateConfig",
  },
  {
    method: "patch",
    route: "/api/config",
    controller: ApiConfigController,
    middlewares: [authMiddleware, userMiddleware, isAdminMiddleware],
    action: "partialConfig",
  },
  {
    method: "delete",
    route: "/api/config/:id",
    controller: ApiConfigController,
    middlewares: [authMiddleware, userMiddleware, isAdminMiddleware],
    action: "delete",
  },
];
