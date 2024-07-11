import ReportGeneratorController from "../controller/ReportGeneratorController";
import { authMiddleware } from "../../auth/middlewares/authMiddleware";
import { userMiddleware } from "../../auth/middlewares/userMiddleware";
import { licenseMiddleware } from "../../managers/license/middlewares/licenseMiddleware";
import { DJ08Controller } from "../controller/DJ08Controller";

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
  {
    method: "get",
    route: "/report/dj08/all",
    controller: DJ08Controller,
    middlewares: [authMiddleware, userMiddleware],
    action: "allDJ08",
  },
  {
    method: "put",
    route: "/dj08",
    controller: DJ08Controller,
    middlewares: [authMiddleware, userMiddleware],
    action: "updateDJ08",
  },
];
