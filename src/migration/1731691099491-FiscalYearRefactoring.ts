import { MigrationInterface, QueryRunner } from "typeorm";

export class FiscalYearRefactoring1731691099491 implements MigrationInterface {
  name = "FiscalYearRefactoring1731691099491";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fiscal_year" ADD "primary" boolean NOT NULL DEFAULT false`
    );
    const profileSetPrimaryFiscalYear: {
      Profile_id: number;
      Profile__Profile_fiscalYear_id: number;
      Profile__Profile_fiscalYear_created_at: Date | string;
      Profile__Profile_fiscalYear_primary: boolean;
    }[] = await queryRunner.query(
      `SELECT "Profile"."id" AS "Profile_id", "Profile__Profile_fiscalYear"."id" AS "Profile__Profile_fiscalYear_id", "Profile__Profile_fiscalYear"."created_at" AS "Profile__Profile_fiscalYear_created_at", "Profile__Profile_fiscalYear"."primary" AS "Profile__Profile_fiscalYear_primary" FROM "profile" "Profile" LEFT JOIN "fiscal_year" "Profile__Profile_fiscalYear" ON "Profile__Profile_fiscalYear"."profileId"="Profile"."id" ORDER BY "Profile"."id" ASC, "Profile__Profile_fiscalYear_id" ASC, "Profile__Profile_fiscalYear_created_at" ASC`
    );

    const fiscalYearToUpdate: Map<
      number,
      {
        id: number;
        created_at: Date | string;
        primary: boolean;
      }
    > = new Map();

    for (const recorde of profileSetPrimaryFiscalYear) {
      if (!fiscalYearToUpdate.get(recorde.Profile_id)) {
        fiscalYearToUpdate.set(recorde.Profile_id, {
          id: recorde.Profile__Profile_fiscalYear_id,
          created_at: recorde.Profile__Profile_fiscalYear_created_at,
          primary: recorde.Profile__Profile_fiscalYear_primary,
        });

        await queryRunner.query(
          `UPDATE "fiscal_year" SET "primary"=true WHERE "id"=${recorde.Profile__Profile_fiscalYear_id};`
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fiscal_year" DROP COLUMN "primary"`);
  }
}
