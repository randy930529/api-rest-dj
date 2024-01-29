import ReportGeneratorController from "../controller/ReportGeneratorController";
import { authMiddleware } from "../../auth/middlewares/authMiddleware";
import { nextFunction } from "../../auth/middlewares/nextMiddleware";

export const reportsRoutes = [
  {
    method: "get",
    route: "/report/expense",
    controller: ReportGeneratorController,
    middlewares: [authMiddleware],
    action: "generateOperationsExpenseReport",
  },
  {
    method: "get",
    route: "/report/income",
    controller: ReportGeneratorController,
    middlewares: [nextFunction],
    action: "generateOperationsIncomeReport",
  },
];
