import { ElementController } from "../controller/ElementController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";
import { userMiddleware } from "../../../auth/middlewares/userMiddleware";

export const elementRoutes = [
  {
    method: "post",
    route: "/element",
    controller: ElementController,
    middlewares: [authMiddleware, userMiddleware],
    action: "createElement",
  },
  {
    method: "get",
    route: "/elements",
    controller: ElementController,
    middlewares: [authMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/element/:id",
    controller: ElementController,
    middlewares: [authMiddleware],
    action: "onElement",
  },
  {
    method: "put",
    route: "/element",
    controller: ElementController,
    middlewares: [authMiddleware],
    action: "updateElement",
  },
  {
    method: "patch",
    route: "/element",
    controller: ElementController,
    middlewares: [authMiddleware],
    action: "partialUpdateElement",
  },
  {
    method: "delete",
    route: "/element/:id",
    controller: ElementController,
    middlewares: [authMiddleware],
    action: "deleteElement",
  },
];
