import { MigrationInterface, QueryRunner } from "typeorm";

export class ProfileAddressRefactoring1725511836443
  implements MigrationInterface
{
  name = "ProfileAddressRefactoring1725511836443";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profile_address" ALTER COLUMN "number" TYPE varchar(10)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profile_address" ALTER COLUMN "number" TYPE varchar(4)`
    );
  }
}
