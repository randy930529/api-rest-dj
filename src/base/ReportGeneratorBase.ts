import puppeteer from "puppeteer";
import { JWT } from "../auth/security/jwt";
import { SectionState } from "../entity/SectionState";
import { SupportDocument } from "../entity/SupportDocument";

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

      const pdfBuffer = await page.pdf();

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
    month,
  }: {
    token: string;
    type: string;
    month?: number;
  }): Promise<SupportDocument[]> {
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

    const infoReportToDataBase: SupportDocument[] =
      await SupportDocument.createQueryBuilder(`document`)
        .select([`document.amount`, `document.date`])
        .leftJoinAndSelect(`document.element`, `element`)
        .leftJoin(`document.fiscalYear`, `fiscalYear`)
        .leftJoin(`fiscalYear.profile`, `profile`)
        .where(`fiscalYear.id= :fiscalYearId`, { fiscalYearId })
        .andWhere(`profile.id= :profileId`, { profileId })
        .andWhere(`document.type_document= :type`, {
          type,
        })
        .andWhere(`element.type= :type`, { type })
        .andWhere(conditionMonth, { month })
        .orderBy(`document.date`, `ASC`)
        .addOrderBy(`element.id`, `ASC`)
        .getMany();

    return infoReportToDataBase;
  }
}

export default ReportGenerator;
