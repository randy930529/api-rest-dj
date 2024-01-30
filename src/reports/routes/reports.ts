import ReportGeneratorController from "../controller/ReportGeneratorController";
import { authMiddleware } from "../../auth/middlewares/authMiddleware";

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
    middlewares: [authMiddleware],
    action: "generateOperationsIncomeReport",
  },
];
