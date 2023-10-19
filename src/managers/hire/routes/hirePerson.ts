import { HiredPersonController } from "../controller/HiredPersonController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";
import { isAdminMiddleware } from "../../../auth/middlewares/isAdminMiddleware";

export const hiredPersonRoutes = [
  {
    method: "post",
    route: "/hired/person",
    controller: HiredPersonController,
    middlewares: [authMiddleware],
    action: "createhiredPerson",
  },
  {
    method: "get",
    route: "/hired/persons",
    controller: HiredPersonController,
    middlewares: [authMiddleware, isAdminMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/hired/person/:id",
    controller: HiredPersonController,
    middlewares: [authMiddleware],
    action: "onhiredPerson",
  },
  {
    method: "put",
    route: "/hired/person",
    controller: HiredPersonController,
    middlewares: [authMiddleware],
    action: "updatehiredPerson",
  },
  {
    method: "patch",
    route: "/hired/person",
    controller: HiredPersonController,
    middlewares: [authMiddleware],
    action: "partialUpdatehiredPerson",
  },
  {
    method: "delete",
    route: "/hired/person/:id",
    controller: HiredPersonController,
    middlewares: [authMiddleware],
    action: "deletehiredPerson",
  },
];
