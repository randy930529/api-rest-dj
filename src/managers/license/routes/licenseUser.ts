import { LicenseUserController } from "../controller/LicenseUserController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";
import { isAdminMiddleware } from "../../../auth/middlewares/isAdminMiddleware";

export const LicenseUserRoutes = [
  {
    method: "post",
    route: "/license/user",
    controller: LicenseUserController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "createLicenseUser",
  },
  {
    method: "get",
    route: "/license/users",
    controller: LicenseUserController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/license/user/:id",
    controller: LicenseUserController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "onLicenseUser",
  },
  {
    method: "put",
    route: "/license/user",
    controller: LicenseUserController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "updateLicenseUser",
  },
  {
    method: "patch",
    route: "/license/user",
    controller: LicenseUserController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "partialUpdateLicenseUser",
  },
  {
    method: "delete",
    route: "/license/user/:id",
    controller: LicenseUserController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "deleteLicenseUser",
  },
];