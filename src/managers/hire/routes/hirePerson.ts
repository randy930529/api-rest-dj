import { HiredPersonController } from "../controller/HiredPersonController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

export const hiredPersonRoutes = [
  {
    method: "post",
    route: "/hired/person",
    controller: HiredPersonController,
    middlewares: [authMiddleware],
    action: "createHiredPerson",
  },
  {
    method: "get",
    route: "/hired/persons",
    controller: HiredPersonController,
    middlewares: [authMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/hired/person/:id",
    controller: HiredPersonController,
    middlewares: [authMiddleware],
    action: "onHiredPerson",
  },
  {
    method: "put",
    route: "/hired/person",
    controller: HiredPersonController,
    middlewares: [authMiddleware],
    action: "updateHiredPerson",
  },
  {
    method: "patch",
    route: "/hired/person",
    controller: HiredPersonController,
    middlewares: [authMiddleware],
    action: "partialUpdateHiredPerson",
  },
  {
    method: "delete",
    route: "/hired/person/:id",
    controller: HiredPersonController,
    middlewares: [authMiddleware],
    action: "deleteHiredPerson",
  },
];
