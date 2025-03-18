import { SupportDocument } from "../../../entity/SupportDocument";
import { SupportDocumentPartialType } from "../../../utils/definitions";

export async function getSupportDocumentToReportData(
  fiscalYearId: number,
  profileId: number,
  year: number,
  type: string,
  conditionMonth: string,
  month: number
): Promise<SupportDocumentPartialType[]> {
  return await SupportDocument.createQueryBuilder(`document`)
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
    .andWhere(`element.group != 'emty      '`)
    .andWhere(conditionMonth, { month })
    .orderBy(`document.date`, `ASC`)
    .addOrderBy(`element.id`, `ASC`)
    .groupBy(`document.date`)
    .addGroupBy(`document.id`)
    .addGroupBy(`document.is_bank`)
    .addGroupBy(`element.id`)
    .addGroupBy(`element.group`)
    .addGroupBy(`amount`)
    .getRawMany();
}
