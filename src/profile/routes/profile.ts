import { ProfileController } from "../controller/ProfileController";
import { authMiddleware } from "../../auth/middlewares/authMiddleware";
import { isAdminMiddleware } from "../../auth/middlewares/isAdminMiddleware";

export const profileRoutes = [
  {
    method: "post",
    route: "/profile",
    controller: ProfileController,
    middlewares: [authMiddleware],
    action: "createProfile",
  },
  {
    method: "get",
    route: "/profiles",
    controller: ProfileController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/profile/:id",
    controller: ProfileController,
    middlewares: [authMiddleware],
    action: "onProfile",
  },
  {
    method: "put",
    route: "/profile",
    controller: ProfileController,
    middlewares: [authMiddleware],
    action: "updateProfile",
  },
  {
    method: "patch",
    route: "/profile",
    controller: ProfileController,
    middlewares: [authMiddleware],
    action: "partialUpdate",
  },
  {
    method: "delete",
    route: "/profile/:id",
    controller: ProfileController,
    middlewares: [authMiddleware],
    action: "deleteProfile",
  },
  {
    method: "post",
    route: "/profile/:currentProfileId/:newCurrentProfileId",
    controller: ProfileController,
    middlewares: [authMiddleware],
    action: "setCurrentProfile",
  },
];
