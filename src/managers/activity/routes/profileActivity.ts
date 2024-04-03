import { ProfileActivityController } from "../controller/ProfileActivityController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

export const profileActivityRoutes = [
  {
    method: "post",
    route: "/profileActivity",
    controller: ProfileActivityController,
    middlewares: [authMiddleware],
    action: "createProfileActivity",
  },
  {
    method: "get",
    route: "/profileActivities",
    controller: ProfileActivityController,
    middlewares: [authMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/profileActivity/:id",
    controller: ProfileActivityController,
    middlewares: [authMiddleware],
    action: "onProfileActivity",
  },
  {
    method: "put",
    route: "/profileActivity",
    controller: ProfileActivityController,
    middlewares: [authMiddleware],
    action: "updateProfileActivity",
  },
  {
    method: "delete",
    route: "/profileActivity/:id",
    controller: ProfileActivityController,
    middlewares: [authMiddleware],
    action: "deleteProfileActivity",
  },
];
