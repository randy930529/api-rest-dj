import puppeteer, { PDFMargin } from "puppeteer";
import { SupportDocumentPartialType } from "../utils/definitions";
import { getSupportDocumentToReportData } from "./utils/query/supportDocumentsDataToReport.fetch";
import { getSectionUserToReport } from "./utils/query/sectionUserToReport.fetch";

class ReportGenerator {
  private chromePath: string;

  constructor(chromePath: string) {
    this.chromePath = chromePath;
  }

  async generatePDF({
    htmlContent,
    margin,
    landscape = false,
  }: {
    htmlContent: string;
    margin?: PDFMargin;
    landscape?: boolean;
  }): Promise<Buffer> {
    try {
      const browser = await puppeteer.launch({
        headless: "new",
        executablePath: this.chromePath,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();

      await page.setContent(htmlContent);

      const pdfBuffer = await page.pdf({
        format: "LETTER",
        landscape,
        margin,
      });

      await page.close();
      await browser.close();

      return pdfBuffer;
    } catch (error) {
      console.error(error);
      throw new Error("Generate pdf of report faild.");
    }
  }

  async getInfoReportToDataBase({
    userId,
    type,
    month,
  }: {
    userId: number;
    type: string;
    month?: number;
  }): Promise<SupportDocumentPartialType[]> {
    const existToSectionUser = await getSectionUserToReport(userId);
    const { profile, fiscalYear } = existToSectionUser;

    const conditionMonth: string = month
      ? `EXTRACT(month FROM document.date)= :month`
      : `true`;

    const infoReportToDataBase = await getSupportDocumentToReportData(
      fiscalYear.id,
      profile.id,
      fiscalYear.year,
      type,
      conditionMonth,
      month
    );

    return infoReportToDataBase;
  }
}

export default ReportGenerator;
