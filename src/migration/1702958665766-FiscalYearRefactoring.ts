import { MigrationInterface, QueryRunner } from "typeorm";

export class FiscalYearRefactoring1702958665766 implements MigrationInterface {
  name = "FiscalYearRefactoring1702958665766";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fiscal_year" ALTER COLUMN "date" SET DEFAULT '"2023-12-19T04:04:28.571Z"'`
    );
    await queryRunner.query(
      `UPDATE "fiscal_year" SET "date" = '2023-12-19T04:04:28.571Z' WHERE "date" IS NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "support_document" ALTER COLUMN "date" SET DEFAULT '"2023-12-19T04:04:28.608Z"'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "support_document" ALTER COLUMN "date" SET DEFAULT '2023-12-19 03:59:45.658'`
    );
    await queryRunner.query(
      `UPDATE "fiscal_year" SET "date"=NULL WHERE "date" IS "2023-12-19T04:04:28.571Z"`
    );
    await queryRunner.query(
      `ALTER TABLE "fiscal_year" ALTER COLUMN "date" SET DEFAULT '2023-12-19 03:59:44.742'`
    );
  }
}
