import { MigrationInterface, QueryRunner } from "typeorm";

export class LicenseUserRefactoring1706675924906 implements MigrationInterface {
  name = "LicenseUserRefactoring1706675924906";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "section_state" DROP CONSTRAINT "FK_2e515cec68033b41d7f61ee52a8"`
    );
    await queryRunner.query(
      `ALTER TABLE "section_state" DROP CONSTRAINT "REL_2e515cec68033b41d7f61ee52a"`
    );
    await queryRunner.query(
      `ALTER TABLE "section_state" DROP COLUMN "licenseUserLicenseKey"`
    );
    await queryRunner.query(
      `ALTER TABLE "tm_bill" ADD "validDate" TIMESTAMP NOT NULL DEFAULT '"2024-01-31T05:38:46.882Z"'`
    );
    await queryRunner.query(
      `ALTER TABLE "license_user" DROP CONSTRAINT "PK_f707a093ce92e4fe5b8a4ec656b"`
    );
    await queryRunner.query(
      `ALTER TABLE "license_user" ADD CONSTRAINT "PK_260c9bd19158aa10bf92ded088e" PRIMARY KEY ("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "license_user" DROP CONSTRAINT "UQ_2ac06c6b8425092a3ba28112e5b"`
    );
    await queryRunner.query(
      `ALTER TABLE "license_user" DROP COLUMN "licenseKey"`
    );
    await queryRunner.query(
      `ALTER TABLE "license_user" ADD "licenseKey" character varying(20) NOT NULL DEFAULT 'b0d102cd-27ea-4745-b'`
    );
    await queryRunner.query(
      `UPDATE "license_user" SET "licenseKey" = substring(uuid_generate_v4()::text, 1, 20)`
    );
    await queryRunner.query(
      `ALTER TABLE "license_user" ADD CONSTRAINT "UQ_2ac06c6b8425092a3ba28112e5b" UNIQUE ("licenseKey")`
    );
    await queryRunner.query(
      `ALTER TABLE "license_user" ALTER COLUMN "expirationDate" SET DEFAULT '"2024-02-07T04:38:46.884Z"'`
    );
    await queryRunner.query(
      `ALTER TABLE "fiscal_year" ALTER COLUMN "date" SET DEFAULT '"2024-01-01T05:00:00.000Z"'`
    );
    await queryRunner.query(
      `ALTER TABLE "support_document" ALTER COLUMN "date" SET DEFAULT '"2024-01-31T04:38:46.944Z"'`
    );
    await queryRunner.query(
      `ALTER TABLE "section_state" ADD CONSTRAINT "UQ_979b879cdcb6b9673418deaf868" UNIQUE ("licenseUserId")`
    );
    await queryRunner.query(
      `ALTER TABLE "section_state" ADD CONSTRAINT "FK_979b879cdcb6b9673418deaf868" FOREIGN KEY ("licenseUserId") REFERENCES "license_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "section_state" DROP CONSTRAINT "FK_979b879cdcb6b9673418deaf868"`
    );
    await queryRunner.query(
      `ALTER TABLE "section_state" DROP CONSTRAINT "UQ_979b879cdcb6b9673418deaf868"`
    );
    await queryRunner.query(
      `ALTER TABLE "support_document" ALTER COLUMN "date" SET DEFAULT '2024-01-30 06:36:14.516'`
    );
    await queryRunner.query(
      `ALTER TABLE "fiscal_year" ALTER COLUMN "date" SET DEFAULT '2024-01-01 05:00:00'`
    );
    await queryRunner.query(
      `ALTER TABLE "license_user" ALTER COLUMN "expirationDate" SET DEFAULT '2024-02-06 06:36:14.219'`
    );
    await queryRunner.query(
      `ALTER TABLE "license_user" DROP CONSTRAINT "UQ_2ac06c6b8425092a3ba28112e5b"`
    );
    await queryRunner.query(
      `ALTER TABLE "license_user" DROP COLUMN "licenseKey"`
    );
    await queryRunner.query(
      `ALTER TABLE "license_user" ADD "licenseKey" uuid NOT NULL DEFAULT uuid_generate_v4()`
    );
    await queryRunner.query(
      `UPDATE "license_user" SET "licenseKey" = uuid_generate_v4()`
    );
    await queryRunner.query(
      `ALTER TABLE "license_user" ADD CONSTRAINT "UQ_2ac06c6b8425092a3ba28112e5b" UNIQUE ("licenseKey")`
    );
    await queryRunner.query(
      `ALTER TABLE "license_user" DROP CONSTRAINT "PK_260c9bd19158aa10bf92ded088e"`
    );
    await queryRunner.query(
      `ALTER TABLE "license_user" ADD CONSTRAINT "PK_f707a093ce92e4fe5b8a4ec656b" PRIMARY KEY ("id", "licenseKey")`
    );
    await queryRunner.query(`ALTER TABLE "tm_bill" DROP COLUMN "validDate"`);
    await queryRunner.query(
      `ALTER TABLE "section_state" ADD "licenseUserLicenseKey" uuid`
    );
    await queryRunner.query(
      `ALTER TABLE "section_state" ADD CONSTRAINT "REL_2e515cec68033b41d7f61ee52a" UNIQUE ("licenseUserId", "licenseUserLicenseKey")`
    );
    await queryRunner.query(
      `ALTER TABLE "section_state" ADD CONSTRAINT "FK_2e515cec68033b41d7f61ee52a8" FOREIGN KEY ("licenseUserId", "licenseUserLicenseKey") REFERENCES "license_user"("id","licenseKey") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
