import { ProfileEnterpriseController } from "../controller/ProfileEnterpriseController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

export const profileEnterpriseRoutes = [
  {
    method: "post",
    route: "/profile/enterprise",
    controller: ProfileEnterpriseController,
    middlewares: [authMiddleware],
    action: "create",
  },
  {
    method: "get",
    route: "/profile/enterprises",
    controller: ProfileEnterpriseController,
    middlewares: [authMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/profile/enterprise/:id",
    controller: ProfileEnterpriseController,
    middlewares: [authMiddleware],
    action: "on",
  },
  {
    method: "put",
    route: "/profile/enterprise",
    controller: ProfileEnterpriseController,
    middlewares: [authMiddleware],
    action: "update",
  },
  {
    method: "delete",
    route: "/profile/enterprise/:id",
    controller: ProfileEnterpriseController,
    middlewares: [authMiddleware],
    action: "delete",
  },
];
