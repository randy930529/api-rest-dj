import { SupportDocumentController } from "../controller/SupportDocumentController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";
import { userMiddleware } from "../../../auth/middlewares/userMiddleware";
import { licenseMiddleware } from "../../license/middlewares/licenseMiddleware";

export const supportDocumentRoutes = [
  {
    method: "post",
    route: "/support/document",
    controller: SupportDocumentController,
    middlewares: [authMiddleware, userMiddleware, licenseMiddleware],
    action: "createSupportDocument",
  },
  {
    method: "get",
    route: "/support/documents",
    controller: SupportDocumentController,
    middlewares: [authMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/support/document/:id",
    controller: SupportDocumentController,
    middlewares: [authMiddleware],
    action: "onSupportDocument",
  },
  {
    method: "put",
    route: "/support/document",
    controller: SupportDocumentController,
    middlewares: [authMiddleware],
    action: "updateSupportDocument",
  },
  {
    method: "delete",
    route: "/support/document/:id",
    controller: SupportDocumentController,
    middlewares: [authMiddleware],
    action: "deleteSupportDocument",
  },
];
