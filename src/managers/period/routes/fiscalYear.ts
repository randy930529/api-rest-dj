import { FiscalYearController } from "../controller/FiscalYearController";
import { authMiddleware } from "../../../auth/middlewares/authMiddleware";

export const fiscalYearRoutes = [
  {
    method: "post",
    route: "/fiscal/year",
    controller: FiscalYearController,
    middlewares: [authMiddleware],
    action: "createFiscalYear",
  },
  {
    method: "get",
    route: "/fiscal/years",
    controller: FiscalYearController,
    middlewares: [authMiddleware],
    action: "all",
  },
  {
    method: "get",
    route: "/fiscal/year/:id",
    controller: FiscalYearController,
    middlewares: [authMiddleware],
    action: "onFiscalYear",
  },
  {
    method: "put",
    route: "/fiscal/year",
    controller: FiscalYearController,
    middlewares: [authMiddleware],
    action: "updateFiscalYear",
  },
  {
    method: "patch",
    route: "/fiscal/year",
    controller: FiscalYearController,
    middlewares: [authMiddleware],
    action: "partialUpdateFiscalYear",
  },
  {
    method: "delete",
    route: "/fiscal/year/:id",
    controller: FiscalYearController,
    middlewares: [authMiddleware],
    action: "deleteFiscalYear",
  },
];
