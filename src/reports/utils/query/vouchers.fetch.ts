import { FindOperator, FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { Voucher } from "../../../entity/Voucher";

export const VOUCHER_SELECT: FindOptionsSelect<Voucher> = {
  voucherDetails: {
    id: true,
    debe: true,
    haber: true,
    account: { id: true, code: true, description: true },
  },
  supportDocument: {
    id: true,
    type_document: true,
    document: true,
    element: { id: true, description: true },
  },
};

export const VOUCHER_RELATIONS: FindOptionsRelations<Voucher> = {
  voucherDetails: { account: true },
  supportDocument: { element: true },
};

export async function getDataVoucherReport(
  fiscalYearId: number,
  searchRangeDate: Date | FindOperator<Date>,
  searchRangeNumber: number | FindOperator<number>
): Promise<Voucher[]> {
  return await Voucher.find({
    select: VOUCHER_SELECT,
    relations: VOUCHER_RELATIONS,
    where: {
      supportDocument: { fiscalYear: { id: fiscalYearId } },
      date: searchRangeDate,
      number: searchRangeNumber,
    },
    order: { number: "ASC" },
  });
}
