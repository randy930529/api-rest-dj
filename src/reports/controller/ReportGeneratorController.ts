import { NextFunction, Request, Response } from "express";
import * as pug from "pug";
import * as path from "path";
import ReportGenerator from "../../base/ReportGeneratorBase";
import { splitArrayIntoParts } from "../../utils/splitArrayIntoParts";
import { SupportDocument } from "../../entity/SupportDocument";

const pugTemplatePath = (template: string) =>
  path.join(__dirname, `../../utils/views/reports/${template}.pug`);

class ReportGeneratorController extends ReportGenerator {
  private templatePath: string;
  private defaultFileName: string;

  constructor(
    chromePath: string,
    templatePath: string,
    defaultFileName: string
  ) {
    super(chromePath);
    this.templatePath = templatePath;
    this.defaultFileName = defaultFileName;
  }

  async generateOperationsExpenseReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      this.templatePath = pugTemplatePath("operationsExpenseReport");
      const token = req.headers.authorization.split(" ")[1];

      const getInfoReportToDataBase = await this.getInfoReportToDataBase({
        token,
        type: "g",
      });

      console.log(getInfoReportToDataBase);

      const compiledTemplate = pug.compileFile(this.templatePath);
      res.send(compiledTemplate({ data: req.body }));
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }

  async generateOperationsIncomeReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      this.templatePath = pugTemplatePath("operationsIncomeReport");
      const token = req.headers.authorization.split(" ")[1];

      const getInfoReportToDataBase = await this.getInfoReportToDataBase({
        token,
        type: "i",
      });

      const matrix = splitArrayIntoParts<SupportDocument>(
        getInfoReportToDataBase,
        6
      );

      console.log(getInfoReportToDataBase, matrix);

      const compiledTemplate = pug.compileFile(this.templatePath);
      const data = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ];

      const totals = [0, 0, 0, 0, 0];

      res.send(compiledTemplate({ data, totals }));
    } catch (error) {
      if (res.statusCode === 200) res.status(500);
      next(error);
    }
  }
}

export default ReportGeneratorController;
