import { ProfileController } from "../controller/ProfileController";
import { authMiddleware } from "../../auth/middlewares/authMiddleware";
import { isAdminMiddleware } from "../../auth/middlewares/isAdminMiddleware";
import { userMiddleware } from "../../auth/middlewares/userMiddleware";

export const profileRoutes = [
  {
    method: "post",
    route: "/profile",
    controller: ProfileController,
    middlewares: [authMiddleware, userMiddleware],
    action: "createProfile",
  },
  {
    method: "get",
    route: "/profiles",
    controller: ProfileController,
    middlewares: [authMiddleware, userMiddleware, isAdminMiddleware],
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
    method: "put",
    route: "/profileAddress",
    controller: ProfileController,
    middlewares: [authMiddleware],
    action: "updateAddress",
  },
  {
    method: "patch",
    route: "/profileAddress",
    controller: ProfileController,
    middlewares: [authMiddleware],
    action: "partialUpdateAddress",
  },
];
