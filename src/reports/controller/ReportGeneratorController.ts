import puppeteer from "puppeteer";
import * as pug from "pug";
import ReportGenerator from "../../base/ReportGeneratorBase";
import { Request, Response } from "express";

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

  public async generatePDF(data: any, fileName?: string): Promise<Buffer> {
    try {
      // Compilar la plantilla Pug
      const compiledTemplate = pug.compileFile(this.templatePath);

      // Generar el contenido HTML utilizando la plantilla y los datos proporcionados
      const htmlContent = compiledTemplate({ data });

      // Crear una nueva instancia de Puppeteer
      const browser = await puppeteer.launch({
        //executablePath: this.chromePath,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      // Abrir una nueva página en el navegador
      const page = await browser.newPage();

      // Establecer el contenido HTML en la página
      await page.setContent(htmlContent);

      // Generar el informe en formato PDF
      const pdfBuffer = await page.pdf();

      // Cerrar la página y el navegador
      await page.close();
      await browser.close();

      // Establecer el nombre del archivo PDF
      const finalFileName = fileName || this.defaultFileName;

      return pdfBuffer;
    } catch (error) {
      console.error("Error al generar el informe en PDF:", error);
      throw new Error("Error al generar el informe en PDF");
    }
  }

  async pdf(req: Request, res: Response): Promise<void> {
    try {
      const compiledTemplate = pug.compileFile(
        "D:\\ADMINISTRADOR\\00project\\API Nodejs\\api-rest-dj\\src\\utils\\views\\reports\\operationsIncomeReport.pug"
      );
      res.send(compiledTemplate({ data: req.body }));
    } catch (error) {
      console.error("Error al generar el informe en PDF:", error);
      throw new Error("Error al generar el informe en PDF");
    }
  }
}

export default ReportGeneratorController;
