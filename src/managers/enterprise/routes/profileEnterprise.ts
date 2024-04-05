import { ProfileEnterpriseController } from "../controller/ProfileEnterpriseController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

export const profileEnterpriseRoutes = [
  {
    method: "post",
    route: "/profile/enterprise",
    controller: ProfileEnterpriseController,
    middlewares: [authMiddleware],
    action: "createProfileEnterprise",
  },
  {
    method: "get",
    route: "/profileEnterprises",
    controller: ProfileEnterpriseController,
    middlewares: [authMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/profile/enterprise/:id",
    controller: ProfileEnterpriseController,
    middlewares: [authMiddleware],
    action: "onProfileEnterprise",
  },
  {
    method: "put",
    route: "/profile/enterprise",
    controller: ProfileEnterpriseController,
    middlewares: [authMiddleware],
    action: "updateProfileEnterprise",
  },
  {
    method: "delete",
    route: "/profile/enterprise/:id",
    controller: ProfileEnterpriseController,
    middlewares: [authMiddleware],
    action: "deleteProfileEnterprise",
  },
];
