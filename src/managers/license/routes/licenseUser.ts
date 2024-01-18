import { LicenseUserController } from "../controller/LicenseUserController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";
import { isAdminMiddleware } from "../../../auth/middlewares/isAdminMiddleware";

export const licenseUserRoutes = [
  {
    method: "post",
    route: "/license/user",
    controller: LicenseUserController,
    middlewares: [authMiddleware],
    action: "createLicenseUser",
  },
  {
    method: "get",
    route: "/licenses/user",
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
