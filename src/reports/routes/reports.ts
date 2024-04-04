import ReportGeneratorController from "../controller/ReportGeneratorController";
import { authMiddleware } from "../../auth/middlewares/authMiddleware";
import { userMiddleware } from "../../auth/middlewares/userMiddleware";
import { licenseMiddleware } from "../../managers/license/middlewares/licenseMiddleware";

export const reportsRoutes = [
  {
    method: "post",
    route: "/report/expense",
    controller: ReportGeneratorController,
    middlewares: [authMiddleware, userMiddleware, licenseMiddleware],
    action: "generateOperationsExpenseReport",
  },
  {
    method: "post",
    route: "/report/income",
    controller: ReportGeneratorController,
    middlewares: [authMiddleware, userMiddleware, licenseMiddleware],
    action: "generateOperationsIncomeReport",
  },
  {
    method: "post",
    route: "/report/income/annual",
    controller: ReportGeneratorController,
    middlewares: [authMiddleware, userMiddleware, licenseMiddleware],
    action: "generateOperationsIncomeReportAnnual",
  },
  {
    method: "post",
    route: "/report/expense/annual",
    controller: ReportGeneratorController,
    middlewares: [authMiddleware, userMiddleware, licenseMiddleware],
    action: "generateOperationsExpenseReportAnnual",
  },
  {
    method: "post",
    route: "/report/dj08",
    controller: ReportGeneratorController,
    middlewares: [authMiddleware, userMiddleware, licenseMiddleware],
    action: "generateDJ08",
  },
];
