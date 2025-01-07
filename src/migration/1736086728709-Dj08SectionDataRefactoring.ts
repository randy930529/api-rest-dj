import { MigrationInterface, QueryRunner } from "typeorm";
import {
  AllDataSectionsDj08Type,
  ObjectSectionGType,
  ProgressiveScaleType,
} from "../utils/definitions";
import { SectionName } from "../entity/Dj08SectionData";
import { setDataSectionG } from "../managers/accounting/utils/updateDJ08";

const oldScaleSectionG = [
  {
    from: 0,
    to: 10000,
    porcentageType: 15,
  },
  {
    from: 10000,
    to: 20000,
    porcentageType: 20,
  },
  {
    from: 20000,
    to: 30000,
    porcentageType: 30,
  },
  {
    from: 30000,
    to: 50000,
    porcentageType: 40,
  },
  {
    from: 50000,
    to: null,
    porcentageType: 50,
  },
];
const newScaleSectionG = [
  {
    from: 0,
    to: 25000,
    porcentageType: 5,
  },
  {
    from: 25000,
    to: 50000,
    porcentageType: 10,
  },
  {
    from: 50000,
    to: 100000,
    porcentageType: 15,
  },
  {
    from: 100000,
    to: 200000,
    porcentageType: 20,
  },
  {
    from: 200000,
    to: 350000,
    porcentageType: 25,
  },
  {
    from: 350000,
    to: 500000,
    porcentageType: 30,
  },
  {
    from: 500000,
    to: 650000,
    porcentageType: 35,
  },
  {
    from: 650000,
    to: 800000,
    porcentageType: 40,
  },
  {
    from: 800000,
    to: 1000000,
    porcentageType: 45,
  },
  {
    from: 1000000,
    to: null,
    porcentageType: 50,
  },
];

type data = {
  id: number;
  data: string;
  year: number;
};

export class Dj08SectionDataRefactoring1736086728709
  implements MigrationInterface
{
  name = "Dj08SectionDataRefactoring1736086728709";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const dj08SetSectionGDataScale = await this.getData(queryRunner);
    await this.setAndUpSectionGDataScale(
      queryRunner,
      dj08SetSectionGDataScale,
      newScaleSectionG
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const dj08SetSectionGDataScale = await this.getData(queryRunner);
    await this.setAndUpSectionGDataScale(
      queryRunner,
      dj08SetSectionGDataScale,
      oldScaleSectionG
    );
  }

  private async getData(qr: QueryRunner): Promise<data[]> {
    return await qr.query(
      `SELECT "ddj"."id" as "id", "ddj"."section_data" AS "data", "fdj"."year" AS "year" FROM "dj08_section_data" "ddj" LEFT JOIN "dj08" "dj" ON "ddj"."dJ08Id"="dj"."id" LEFT JOIN "fiscal_year" "fdj" ON "dj"."fiscalYearId"="fdj"."id" WHERE "fdj"."year" >= 2024 ORDER BY "ddj"."id" ASC`
    );
  }

  private setDateScale(
    F20: number,
    sectionsData: AllDataSectionsDj08Type,
    dataSectionG: ObjectSectionGType,
    scale: ProgressiveScaleType[]
  ): string {
    const data = setDataSectionG(F20, 45, dataSectionG, scale);
    sectionsData[SectionName.SECTION_G] = data;
    sectionsData[SectionName.SECTION_C].data["F21"] = data.totals.import;
    return JSON.stringify(sectionsData);
  }

  private async upData(
    qr: QueryRunner,
    id: number,
    data: string
  ): Promise<void> {
    await qr.query(
      `UPDATE "dj08_section_data" SET "section_data"=$2 WHERE "id"=$1;`,
      [id, data]
    );
  }

  private async setAndUpSectionGDataScale(
    qr: QueryRunner,
    sectionsData: data[],
    scale: ProgressiveScaleType[]
  ): Promise<void> {
    for (const recorde of sectionsData) {
      if (recorde.data) {
        const sectionsData: AllDataSectionsDj08Type = JSON.parse(recorde.data);
        const F20 = sectionsData[SectionName.SECTION_B].data["F20"] as number;
        const dataSectionG = sectionsData[SectionName.SECTION_G]
          .data as ObjectSectionGType;
        const sectionData = this.setDateScale(
          F20,
          sectionsData,
          dataSectionG,
          scale
        );

        await this.upData(qr, recorde.id, JSON.stringify(sectionData));
      }
    }
  }
}
