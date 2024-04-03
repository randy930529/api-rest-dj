import { EnterpriseController } from "../controller/EnterpriseController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

export const enterpriseRoutes = [
  {
    method: "post",
    route: "/enterprise",
    controller: EnterpriseController,
    middlewares: [authMiddleware],
    action: "createEnterprise",
  },
  {
    method: "get",
    route: "/enterprises",
    controller: EnterpriseController,
    middlewares: [authMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/enterprise/:id",
    controller: EnterpriseController,
    middlewares: [authMiddleware],
    action: "onEnterprise",
  },
  {
    method: "put",
    route: "/enterprise",
    controller: EnterpriseController,
    middlewares: [authMiddleware],
    action: "updateEnterprise",
  },
  {
    method: "delete",
    route: "/enterprise/:id",
    controller: EnterpriseController,
    middlewares: [authMiddleware],
    action: "deleteEnterprise",
  },
];
