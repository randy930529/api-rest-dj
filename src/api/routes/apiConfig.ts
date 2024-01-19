import { authMiddleware } from "../../auth/middlewares/authMiddleware";
import { isAdminMiddleware } from "../../auth/middlewares/isAdminMiddleware";
import { ApiConfigController } from "../../api/controller/ApiConfigController";

export const apiConfigRoutes = [
  {
    method: "post",
    route: "/api/config",
    controller: ApiConfigController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "create",
  },
  {
    method: "get",
    route: "/api/configs",
    controller: ApiConfigController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/api/config/:id",
    controller: ApiConfigController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "on",
  },
  {
    method: "put",
    route: "/api/config",
    controller: ApiConfigController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "updateConfig",
  },
  {
    method: "patch",
    route: "/api/config",
    controller: ApiConfigController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "partialConfig",
  },
  {
    method: "delete",
    route: "/api/config/:id",
    controller: ApiConfigController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "delete",
  },
];
