import { LicenseController } from "../controller/LicenseController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";
import { isAdminMiddleware } from "../../../auth/middlewares/isAdminMiddleware";

export const LicenseRoutes = [
  {
    method: "post",
    route: "/license",
    controller: LicenseController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "createLicense",
  },
  {
    method: "get",
    route: "/licenses",
    controller: LicenseController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/license/:id",
    controller: LicenseController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "onLicense",
  },
  {
    method: "put",
    route: "/license",
    controller: LicenseController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "updateLicense",
  },
  {
    method: "patch",
    route: "/license",
    controller: LicenseController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "partialUpdateLicense",
  },
  {
    method: "delete",
    route: "/license/:id",
    controller: LicenseController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "deleteLicense",
  },
  {
    method: "get",
    route: "/licenses/public",
    controller: LicenseController,
    middlewares: [authMiddleware],
    action: "allLicensesPublic",
  },
];
