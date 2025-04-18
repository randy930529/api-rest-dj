import { appConfig } from "../../../../config";
import { SupportDocument } from "../../../entity/SupportDocument";
import { Dj08SectionData } from "../../../entity/Dj08SectionData";
import {
  AllDataSectionsDj08Type,
  DataSectionGType,
  ObjectSectionGType,
  ProgressiveScaleType,
  TotalSectionGType,
} from "../../../utils/definitions";

export function getParseDJ08SectionsData<
  T extends string | AllDataSectionsDj08Type
>(dj08ToUpdate: Dj08SectionData): T {
  if (typeof dj08ToUpdate.section_data === "string")
    return JSON.parse(dj08ToUpdate.section_data);
  return JSON.stringify(dj08ToUpdate.section_data) as unknown as T;
}

export function getDocumentGroup(document: SupportDocument): string {
  const { element } = document;
  if (!element) throw new Error("Get document required element.");

  return element.group?.trim();
}

export function getDocumentsOfToGroup(
  group: string,
  documents: SupportDocument[]
): SupportDocument[] {
  return documents.filter((document) => getDocumentGroup(document) === group);
}

export function setDataSectionG(
  F20: number,
  initRow: number,
  dataSectionG: ObjectSectionGType,
  progressiveScale = appConfig.constantToSectionG
): {
  data: ObjectSectionGType;
  totals: TotalSectionGType;
} {
  const initTotal: TotalSectionGType = {
    baseImponible: 0,
    import: 0,
  };

  progressiveScale.reduce((count, val) => {
    const data = setDataRow(F20, val, initTotal);
    dataSectionG[`F${count}`] = data;
    return count + 1;
  }, initRow);

  return {
    data: dataSectionG,
    totals: initTotal,
  };
}

export function setDataRow(
  F20: number,
  scale: ProgressiveScaleType,
  totalSectionG: TotalSectionGType
): DataSectionGType {
  {
    const { from, to, porcentageType } = scale;
    let baseImponible = 0;

    if (to === null) {
      baseImponible =
        F20 > from ? F20 - (totalSectionG?.baseImponible || 0) : 0;
    } else {
      baseImponible =
        F20 > to ? to - from : F20 - (totalSectionG?.baseImponible || 0);
    }

    const importe = parseFloat(
      ((baseImponible * porcentageType) / 100).toFixed()
    );

    const newRow: DataSectionGType = {
      ...scale,
      baseImponible: parseFloat(baseImponible.toFixed()),
      import: importe,
    };

    totalSectionG.baseImponible += baseImponible;
    totalSectionG.import += importe;

    return newRow;
  }
}

export function getTotalAmountInDocuments(
  documents: SupportDocument[]
): number {
  return documents.reduce((sumTotal, { amount }) => sumTotal + (amount || 0), 0);
}

export function isExpensesDD(
  type: string,
  is_general: boolean,
  group: string
): boolean {
  return type === "g" && is_general && group === "ddgt";
}
