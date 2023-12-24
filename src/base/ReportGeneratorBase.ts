import puppeteer from "puppeteer";
import * as pug from "pug";

class ReportGenerator {
  private chromePath: string;

  constructor(chromePath: string) {
    this.chromePath = chromePath;
  }

  public async generatePDF(
    templatePath: string,
    data: any,
    fileName?: string
  ): Promise<Buffer> {
    try {
      // Compilar la plantilla Pug
      const compiledTemplate = pug.compileFile(templatePath);

      // Generar el contenido HTML utilizando la plantilla y los datos proporcionados
      const htmlContent = compiledTemplate({ data });

      // Crear una nueva instancia de Puppeteer
      const browser = await puppeteer.launch({
        executablePath: this.chromePath,
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
      const finalFileName = fileName || "report.pdf";

      return pdfBuffer;
    } catch (error) {
      console.error("Error al generar el informe en PDF:", error);
      throw new Error("Error al generar el informe en PDF");
    }
  }
}

export default ReportGenerator;
