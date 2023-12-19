import { MigrationInterface, QueryRunner } from "typeorm";

export class SupportDocumentRefactoring1702951216251
  implements MigrationInterface
{
  name = "SupportDocumentRefactoring1702951216251";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "support_document" DROP CONSTRAINT "FK_bee1cf16b29c9e85af5ee979628"`
    );
    await queryRunner.query(
      `ALTER TABLE "support_document" RENAME COLUMN "expenseElementId" TO "elementId"`
    );
    await queryRunner.query(
      `ALTER TABLE "support_document" DROP COLUMN "date"`
    );
    await queryRunner.query(
      `ALTER TABLE "support_document" ADD COLUMN "date" TIMESTAMP`
    );
    await queryRunner.query(
      `UPDATE "support_document" SET "date" = '2023-12-18' WHERE "date" IS NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "support_document" ALTER COLUMN "date" SET NOT NULL`
    );
    await queryRunner.query(
      `CREATE TABLE "element" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "description" character varying(100) NOT NULL, "type" character(1) NOT NULL, "active" boolean NOT NULL DEFAULT false, "is_general" boolean NOT NULL DEFAULT false, "profileId" integer, "accountId" integer, CONSTRAINT "PK_6c5f203479270d39efaad8cd82b" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `INSERT INTO "element" ("created_at", "updated_at", "description", "type", "active", "is_general", "profileId") SELECT "created_at", "updated_at", "description", "type", "active", "is_general", "profileId" FROM "expense_element"`
    );
    await queryRunner.query(`ALTER TABLE "account" ADD "elementsId" integer`);
    await queryRunner.query(`ALTER TABLE "fiscal_year" ADD "date" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "fiscal_year" ALTER COLUMN "date" SET DEFAULT '"2023-12-19T02:00:19.173Z"'`
    );
    await queryRunner.query(
      `ALTER TABLE "support_document" ALTER COLUMN "date" SET DEFAULT '"2023-12-19T02:00:19.212Z"'`
    );
    await queryRunner.query(
      `ALTER TABLE "account" ADD CONSTRAINT "FK_785bdace585a6bc0a39db6994ae" FOREIGN KEY ("elementsId") REFERENCES "element"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "support_document" ADD CONSTRAINT "FK_a7c2b5facd2295be8e6f9305910" FOREIGN KEY ("elementId") REFERENCES "element"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "element" ADD CONSTRAINT "FK_3cd3a895a2c6a6465b9be7c8dca" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "element" ADD CONSTRAINT "FK_062a8121f036f88c3381986153e" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(`DROP TABLE "expense_element"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "element" DROP CONSTRAINT "FK_062a8121f036f88c3381986153e"`
    );
    await queryRunner.query(
      `ALTER TABLE "element" DROP CONSTRAINT "FK_3cd3a895a2c6a6465b9be7c8dca"`
    );
    await queryRunner.query(
      `ALTER TABLE "support_document" DROP CONSTRAINT "FK_a7c2b5facd2295be8e6f9305910"`
    );
    await queryRunner.query(
      `ALTER TABLE "account" DROP CONSTRAINT "FK_785bdace585a6bc0a39db6994ae"`
    );
    await queryRunner.query(
      `ALTER TABLE "support_document" ALTER COLUMN "date" SET DEFAULT '2023-12-18 21:47:44.393'`
    );
    await queryRunner.query(
      `ALTER TABLE "fiscal_year" ALTER COLUMN "date" SET DEFAULT '2023-12-18 21:47:43.884'`
    );
    await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "elementsId"`);
    await queryRunner.query(`DROP TABLE "element"`);
    await queryRunner.query(
      `ALTER TABLE "support_document" RENAME COLUMN "elementId" TO "expenseElementId"`
    );
    await queryRunner.query(
      `ALTER TABLE "support_document" ADD CONSTRAINT "FK_bee1cf16b29c9e85af5ee979628" FOREIGN KEY ("expenseElementId") REFERENCES "expense_element"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
