import ReportGeneratorController from "../controller/ReportGeneratorController";
import { authMiddleware } from "../../auth/middlewares/authMiddleware";
import { userMiddleware } from "../../auth/middlewares/userMiddleware";
import { licenseMiddleware } from "../../managers/license/middlewares/licenseMiddleware";

export const reportsRoutes = [
  {
    method: "get",
    route: "/report/expense",
    controller: ReportGeneratorController,
    middlewares: [authMiddleware, userMiddleware, licenseMiddleware],
    action: "generateOperationsExpenseReport",
  },
  {
    method: "get",
    route: "/report/income",
    controller: ReportGeneratorController,
    middlewares: [authMiddleware, userMiddleware, licenseMiddleware],
    action: "generateOperationsIncomeReport",
  },
  {
    method: "get",
    route: "/report/income/annual",
    controller: ReportGeneratorController,
    middlewares: [authMiddleware, userMiddleware, licenseMiddleware],
    action: "generateOperationsIncomeReportAnnual",
  },
];
