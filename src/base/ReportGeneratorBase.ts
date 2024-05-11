import puppeteer from "puppeteer";
import { JWT } from "../auth/security/jwt";
import { SectionState } from "../entity/SectionState";
import { SupportDocument } from "../entity/SupportDocument";
import { SupportDocumentPartialType } from "../utils/definitions";

class ReportGenerator {
  private chromePath: string;

  constructor(chromePath: string) {
    this.chromePath = chromePath;
  }

  async generatePDF({ htmlContent }: { htmlContent: string }): Promise<Buffer> {
    try {
      const browser = await puppeteer.launch({
        headless: "new",
        executablePath: this.chromePath,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();

      await page.setContent(htmlContent);

      const pdfBuffer = await page.pdf({ format: "LETTER" });

      await page.close();
      await browser.close();

      return pdfBuffer;
    } catch (error) {
      throw new Error("Generate pdf of report faild.");
    }
  }

  async getInfoReportToDataBase({
    token,
    type,
    year,
    month,
  }: {
    token: string;
    type: string;
    year: number;
    month?: number;
  }): Promise<SupportDocumentPartialType[]> {
    const userId: number = JWT.getJwtPayloadValueByKey(token, "id");

    const existToSectionUser: SectionState = await SectionState.findOne({
      relations: ["profile", "fiscalYear"],
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (!existToSectionUser) throw new Error("User section not found.");

    const { profile, fiscalYear } = existToSectionUser;

    const profileId: number | string = profile.id;
    const fiscalYearId: number | string = fiscalYear.id;

    const conditionMonth: string = month
      ? `EXTRACT(month FROM document.date)= :month`
      : `true`;

    const infoReportToDataBase: SupportDocumentPartialType[] =
      await SupportDocument.createQueryBuilder(`document`)
        .select(`EXTRACT('month' FROM document.date)`, `month`)
        .addSelect(`document.date`, `date`)
        .addSelect(`document.is_bank`, `is_bank`)
        .addSelect(`element.id`, `elementId`)
        .addSelect(`element.is_general`, `is_general`)
        .addSelect(`element.group`, `group`)
        .addSelect(`element.description`, `description`)
        .addSelect(`document.amount`, `amount`)
        .leftJoin(`document.element`, `element`, `element.type= :type`, {
          type,
        })
        .leftJoin(`document.fiscalYear`, `fiscalYear`)
        .leftJoin(`fiscalYear.profile`, `profile`)
        .where(`fiscalYear.id= :fiscalYearId`, { fiscalYearId })
        .andWhere(`profile.id= :profileId`, { profileId })
        .andWhere(`document.type_document= :type`, { type })
        .andWhere(`EXTRACT(year FROM document.date)= :year`, { year })
        .andWhere(conditionMonth, { month })
        .orderBy(`document.date`, `ASC`)
        .addOrderBy(`element.id`, `ASC`)
        .groupBy(`document.date`)
        .addGroupBy(`document.is_bank`)
        .addGroupBy(`element.id`)
        .addGroupBy(`element.group`)
        .addGroupBy(`amount`)
        .getRawMany();

    return infoReportToDataBase;
  }
}

export default ReportGenerator;
