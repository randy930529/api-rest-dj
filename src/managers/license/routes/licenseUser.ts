import { LicenseUserController } from "../controller/LicenseUserController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";
import { isAdminMiddleware } from "../../../auth/middlewares/isAdminMiddleware";
import { userMiddleware } from "../../../auth/middlewares/userMiddleware";

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
    middlewares: [authMiddleware, userMiddleware],
    action: "allLicenses",
  },
  {
    method: "get",
    route: "/license/user/:id",
    controller: LicenseUserController,
    middlewares: [authMiddleware],
    action: "onLicenseUser",
  },
  {
    method: "put",
    route: "/license/user",
    controller: LicenseUserController,
    middlewares: [authMiddleware, userMiddleware, isAdminMiddleware],
    action: "updateLicenseUser",
  },
  {
    method: "patch",
    route: "/license/user",
    controller: LicenseUserController,
    middlewares: [authMiddleware, userMiddleware, isAdminMiddleware],
    action: "partialUpdateLicenseUser",
  },
  {
    method: "delete",
    route: "/license/user/:id",
    controller: LicenseUserController,
    middlewares: [authMiddleware, userMiddleware, isAdminMiddleware],
    action: "deleteLicenseUser",
  },
];
