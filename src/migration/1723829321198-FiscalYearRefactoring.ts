import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class FiscalYearRefactoring1723829321198 implements MigrationInterface {
  name = "FiscalYearRefactoring1723829321198";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "fiscal_year",
      new TableColumn({
        name: "is_tcp",
        type: "boolean",
        default: true,
      })
    );

    const sourceProfileActivity = await queryRunner.query(
      `SELECT "ProfileActivity".id, "ProfileActivity"."fiscalYearId","ProfileActivity"."primary","ProfileActivity"."profileId","Profile".is_tcp FROM "profile_activity" "ProfileActivity" LEFT JOIN "profile" "Profile"  ON "ProfileActivity".id="ProfileActivity"."profileId" WHERE "ProfileActivity"."fiscalYearId" IS NOT NULL AND "Profile".is_tcp IS NOT NULL ORDER BY "ProfileActivity"."fiscalYearId" ASC`
    );
    for (const activity of sourceProfileActivity) {
      if (activity.primary) {
        await queryRunner.query(
          `UPDATE fiscal_year SET "is_tcp"=$2 WHERE "id"=$1`,
          [activity.fiscalYearId, activity.is_tcp]
        );
      }
    }
    await queryRunner.dropColumn("profile", "is_tcp");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("fiscal_year", "is_tcp");
    await queryRunner.addColumn(
        "profile",
        new TableColumn({
          name: "is_tcp",
          type: "boolean",
          default: true,
        })
      );
  }
}
