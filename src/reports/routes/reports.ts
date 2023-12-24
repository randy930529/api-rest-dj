import ReportGeneratorController from "../controller/ReportGeneratorController";
import { authMiddleware } from "../../auth/middlewares/authMiddleware";
import { nextFunction } from "../../auth/middlewares/nextMiddleware";

export const reportsRoutes = [
  {
    method: "get",
    route: "/report",
    controller: ReportGeneratorController,
    middlewares: [nextFunction],
    action: "pdf",
  },
];
