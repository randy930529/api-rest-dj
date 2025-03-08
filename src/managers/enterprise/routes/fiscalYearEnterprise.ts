import { FiscalYearEnterpriseController } from "../controller/FiscalYearEnterpriseController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

export const fiscalYearEnterpriseRoutes = [
  {
    method: "post",
    route: "/profile/enterprise",
    controller: FiscalYearEnterpriseController,
    middlewares: [authMiddleware],
    action: "createProfileEnterprise",
  },
  {
    method: "get",
    route: "/profileEnterprises",
    controller: FiscalYearEnterpriseController,
    middlewares: [authMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/profile/enterprise/:id",
    controller: FiscalYearEnterpriseController,
    middlewares: [authMiddleware],
    action: "onProfileEnterprise",
  },
  {
    method: "put",
    route: "/profile/enterprise",
    controller: FiscalYearEnterpriseController,
    middlewares: [authMiddleware],
    action: "updateProfileEnterprise",
  },
  {
    method: "delete",
    route: "/profile/enterprise/:id",
    controller: FiscalYearEnterpriseController,
    middlewares: [authMiddleware],
    action: "deleteProfileEnterprise",
  },
];
