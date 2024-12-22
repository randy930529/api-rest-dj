import { authMiddleware } from "../../auth/middlewares/authMiddleware";
import { userMiddleware } from "../../auth/middlewares/userMiddleware";
import { isAdminMiddleware } from "../../auth/middlewares/isAdminMiddleware";
import { ApiConfigController } from "../../api/controller/ApiConfigController";

export const apiConfigRoutes = [
  {
    method: "get",
    route: "/",
    controller: ApiConfigController,
    middlewares: [],
    action: "apiHome",
  },
  {
    method: "get",
    route: "/media/:type/:file",
    controller: ApiConfigController,
    middlewares: [],
    action: "staticMediaFiles",
  },
  {
    method: "post",
    route: "/api/config",
    controller: ApiConfigController,
    middlewares: [authMiddleware, userMiddleware, isAdminMiddleware],
    action: "createConfig",
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
    method: "delete",
    route: "/api/config/:id",
    controller: ApiConfigController,
    middlewares: [authMiddleware, userMiddleware, isAdminMiddleware],
    action: "delete",
  },
];
