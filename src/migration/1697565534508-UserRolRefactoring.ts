import { MigrationInterface, QueryRunner } from "typeorm";

export class UserRolRefactoring1697565534508 implements MigrationInterface {
  name = "UserRolRefactoring1697565534508";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."user_role_enum" RENAME VALUE 'ghost' TO 'cliente'`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'cliente'`
    );
    await queryRunner.query(
      `ALTER TABLE "profile_hired_person" ALTER COLUMN "date_start" TYPE TIME(6)`
    );
    await queryRunner.query(
      `ALTER TABLE "profile_hired_person" ALTER COLUMN "date_end" TYPE TIME(6)`
    );
    await queryRunner.query(
      `ALTER TABLE "support_document" ALTER COLUMN "date" TYPE TIME(6)`
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "support_document" ALTER COLUMN "date" TYPE TIME(6)`
    );
    await queryRunner.query(
      `ALTER TABLE "profile_hired_person" ALTER COLUMN "date_end" TYPE TIME(6)`
    );
    await queryRunner.query(
      `ALTER TABLE "profile_hired_person" ALTER COLUMN "date_start" TYPE TIME(6)`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."user_role_enum" RENAME VALUE 'cliente' TO 'ghost'`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'ghost'`
    );
  }
}
