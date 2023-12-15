import { MigrationInterface, QueryRunner } from "typeorm";

export class ProfileHiredPersonRefactoring1702618424739
  implements MigrationInterface
{
  name = "ProfileHiredPersonRefactoring1702618424739";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profile_hired_person" DROP COLUMN "date_start"`
    );
    await queryRunner.query(
      `ALTER TABLE "profile_hired_person" ADD COLUMN "date_start" TIMESTAMP`
    );
    await queryRunner.query(
      `UPDATE "profile_hired_person" SET "date_start" = '2023-12-15' WHERE "date_start" IS NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "profile_hired_person" ALTER COLUMN "date_start" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "profile_hired_person" DROP COLUMN "date_end"`
    );
    await queryRunner.query(
      `ALTER TABLE "profile_hired_person" ADD COLUMN "date_end" TIMESTAMP`
    );
    await queryRunner.query(
      `UPDATE "profile_hired_person" SET "date_end" = '2023-12-15' WHERE "date_end" IS NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "profile_hired_person" ALTER COLUMN "date_end" SET NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profile_hired_person" DROP COLUMN "date_end"`
    );
    await queryRunner.query(
      `ALTER TABLE "profile_hired_person" ADD COLUMN "date_end" TIME(7)`
    );
    await queryRunner.query(
      `UPDATE "profile_hired_person" SET "date_end" = '00:00:00.000' WHERE "date_end" IS NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "profile_hired_person" ALTER COLUMN "date_end" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "profile_hired_person" DROP COLUMN "date_start"`
    );
    await queryRunner.query(
      `ALTER TABLE "profile_hired_person" ADD "date_start" TIME(7)`
    );
    await queryRunner.query(
      `UPDATE "profile_hired_person" SET "date_start" = '00:00:00.000' WHERE "date_start" IS NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "profile_hired_person" ALTER COLUMN "date_start" SET NOT NULL`
    );
  }
}
