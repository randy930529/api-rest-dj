import ReportGeneratorDJ08Controller from "../controller/ReportGeneratorDj08Controller";
import ReportGeneratorAccountingController from "../controller/ReportGeneratorAccountingController";
import { authMiddleware } from "../../auth/middlewares/authMiddleware";
import { userMiddleware } from "../../auth/middlewares/userMiddleware";
import { licenseMiddleware } from "../../managers/license/middlewares/licenseMiddleware";
import { DJ08Controller } from "../controller/DJ08Controller";

export const reportsRoutes = [
  {
    method: "post",
    route: "/report/expense",
    controller: ReportGeneratorDJ08Controller,
    middlewares: [authMiddleware, userMiddleware, licenseMiddleware],
    action: "generateOperationsExpenseReport",
  },
  {
    method: "post",
    route: "/report/income",
    controller: ReportGeneratorDJ08Controller,
    middlewares: [authMiddleware, userMiddleware, licenseMiddleware],
    action: "generateOperationsIncomeReport",
  },
  {
    method: "post",
    route: "/report/income/annual",
    controller: ReportGeneratorDJ08Controller,
    middlewares: [authMiddleware, userMiddleware, licenseMiddleware],
    action: "generateOperationsIncomeReportAnnual",
  },
  {
    method: "post",
    route: "/report/expense/annual",
    controller: ReportGeneratorDJ08Controller,
    middlewares: [authMiddleware, userMiddleware, licenseMiddleware],
    action: "generateOperationsExpenseReportAnnual",
  },
  {
    method: "post",
    route: "/report/dj08",
    controller: ReportGeneratorDJ08Controller,
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
  {
    method: "post",
    route: "/completed/payments",
    controller: ReportGeneratorDJ08Controller,
    middlewares: [authMiddleware, userMiddleware, licenseMiddleware],
    action: "generateCompletedPayments",
  },
  {
    method: "post",
    route: "/report/voucher",
    controller: ReportGeneratorAccountingController,
    middlewares: [authMiddleware, userMiddleware, licenseMiddleware],
    action: "generateVoucherReport",
  },
  {
    method: "post",
    route: "/report/mayor",
    controller: ReportGeneratorAccountingController,
    middlewares: [authMiddleware, userMiddleware, licenseMiddleware],
    action: "generateBiggerReport",
  },
  {
    method: "post",
    route: "/report/balance/accounts",
    controller: ReportGeneratorAccountingController,
    middlewares: [authMiddleware, userMiddleware, licenseMiddleware],
    action: "generateBalanceConfirmationAccountsReport",
  },
  {
    method: "post",
    route: "/report/situation/state",
    controller: ReportGeneratorAccountingController,
    middlewares: [authMiddleware, userMiddleware, licenseMiddleware],
    action: "generateSituationStateReport",
  },
  {
    method: "post",
    route: "/report/yield/state",
    controller: ReportGeneratorAccountingController,
    middlewares: [authMiddleware, userMiddleware, licenseMiddleware],
    action: "generateYieldStateReport",
  },
];
