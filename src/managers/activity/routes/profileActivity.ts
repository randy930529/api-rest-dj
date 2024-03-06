import { ProfileActivityController } from "../controller/ProfileActivityController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

export const profileActivityRoutes = [
  {
    method: "post",
    route: "/profileActivity",
    controller: ProfileActivityController,
    middlewares: [authMiddleware],
    action: "create",
  },
  {
    method: "get",
    route: "/profileActivitys",
    controller: ProfileActivityController,
    middlewares: [authMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/profileActivity/:id",
    controller: ProfileActivityController,
    middlewares: [authMiddleware],
    action: "on",
  },
  {
    method: "put",
    route: "/profileActivity",
    controller: ProfileActivityController,
    middlewares: [authMiddleware],
    action: "update",
  },
  {
    method: "delete",
    route: "/profileActivity/:id",
    controller: ProfileActivityController,
    middlewares: [authMiddleware],
    action: "delete",
  },
];
