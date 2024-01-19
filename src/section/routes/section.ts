import { isAdminMiddleware } from "../../auth/middlewares/isAdminMiddleware";
import { authMiddleware } from "../../auth/middlewares/authMiddleware";
import { SectionStateController } from "../controller/SectionStateController";
import { userMiddleware } from "../../auth/middlewares/userMiddleware";

export const sectionRoutes = [
  {
    method: "post",
    route: "/section",
    controller: SectionStateController,
    middlewares: [authMiddleware],
    action: "createSection",
  },
  {
    method: "get",
    route: "/sections",
    controller: SectionStateController,
    middlewares: [authMiddleware],
    action: "allSections",
  },
  {
    method: "get",
    route: "/section",
    controller: SectionStateController,
    middlewares: [authMiddleware],
    action: "userSection",
  },
  {
    method: "get",
    route: "/section/:id",
    controller: SectionStateController,
    middlewares: [authMiddleware],
    action: "on",
  },
  {
    method: "put",
    route: "/section",
    controller: SectionStateController,
    middlewares: [authMiddleware],
    action: "updateSectionState",
  },
  {
    method: "patch",
    route: "/section",
    controller: SectionStateController,
    middlewares: [authMiddleware],
    action: "partialUpdateSectionState",
  },
  {
    method: "delete",
    route: "/section/:id",
    controller: SectionStateController,
    middlewares: [authMiddleware, userMiddleware, isAdminMiddleware],
    action: "delete",
  },
];
