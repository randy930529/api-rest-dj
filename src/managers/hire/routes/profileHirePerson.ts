import { ProfileHiredPersonController } from "../controller/ProfileHiredPersonController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

export const profileHiredPersonRoutes = [
  {
    method: "post",
    route: "/profile/hired/person",
    controller: ProfileHiredPersonController,
    middlewares: [authMiddleware],
    action: "createProfileHiredPerson",
  },
  {
    method: "get",
    route: "/profile/hired/persons",
    controller: ProfileHiredPersonController,
    middlewares: [authMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/profile/hired/person/:id",
    controller: ProfileHiredPersonController,
    middlewares: [authMiddleware],
    action: "onProfileHiredPerson",
  },
  {
    method: "put",
    route: "/profile/hired/person",
    controller: ProfileHiredPersonController,
    middlewares: [authMiddleware],
    action: "updateProfileHiredPerson",
  },
  {
    method: "patch",
    route: "/profile/hired/person",
    controller: ProfileHiredPersonController,
    middlewares: [authMiddleware],
    action: "partialUpdateProfileHiredPerson",
  },
  {
    method: "delete",
    route: "/profile/hired/person/:id",
    controller: ProfileHiredPersonController,
    middlewares: [authMiddleware],
    action: "deleteProfileHiredPerson",
  },
];
