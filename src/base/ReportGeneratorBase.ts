import puppeteer from "puppeteer";
import * as pug from "pug";
import { JWT } from "../auth/security/jwt";
import { SectionState } from "../entity/SectionState";
import { SupportDocument } from "../entity/SupportDocument";

class ReportGenerator {
  private chromePath: string;

  constructor(chromePath: string) {
    this.chromePath = chromePath;
  }

  async generatePDF({
    templatePath,
    data,
    fileName,
  }: {
    templatePath: string;
    data: any;
    fileName?: string;
  }): Promise<Buffer> {
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

  async getInfoReportToDataBase({
    token,
    type,
  }: {
    token: string;
    type: string;
  }): Promise<SupportDocument[]> {
    const userId = JWT.getJwtPayloadValueByKey(token, "id");

    const existToSectionUser = await SectionState.findOne({
      relations: ["profile", "fiscalYear"],
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (!existToSectionUser) throw new Error("User section not found.");

    const { profile, fiscalYear } = existToSectionUser;

    const infoReportToDataBase = await SupportDocument.find({
      select: ["amount", "element"],
      relations: {
        element: { account: true },
      },
      where: {
        fiscalYear: { id: fiscalYear.id, profile: { id: profile.id } },
        element: { type: type },
      },
      order: {
        id: "DESC",
      },
    });

    return infoReportToDataBase;
  }
}

export default ReportGenerator;
