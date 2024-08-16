import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class ProfileActivityRefactoring1723811553050
  implements MigrationInterface
{
  name = "ProfileActivityRefactoring1723811553050";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const sourceSupportDocument = await queryRunner.query(
      `SELECT * FROM support_document ORDER BY "profileActivityId" ASC`
    );
    await queryRunner.addColumn(
      "profile_activity",
      new TableColumn({
        name: "fiscalYearId",
        type: "int",
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      "profile_activity",
      new TableColumn({
        name: "__fiscalYearId__",
        type: "int",
        isNullable: true,
      })
    );
    await queryRunner.createForeignKey(
      "profile_activity",
      new TableForeignKey({
        columnNames: ["fiscalYearId"],
        referencedColumnNames: ["id"],
        referencedTableName: "fiscal_year",
        onDelete: "CASCADE",
      })
    );

    for (const document of sourceSupportDocument) {
      if (document.profileActivityId) {
        await queryRunner.query(
          `UPDATE profile_activity SET "fiscalYearId"=$1, "__fiscalYearId__"=$2 WHERE "id"=$3`,
          [
            document.fiscalYearId,
            document.__fiscalYearId__,
            document.profileActivityId,
          ]
        );
      } else {
        await queryRunner.query(
          `DELETE FROM "support_document" WHERE "id"=$1`,
          [document.id]
        );
      }
    }
    const sourceProfileActivity = await queryRunner.query(
      `SELECT * FROM profile_activity WHERE "fiscalYearId" IS NULL ORDER BY "fiscalYearId" ASC`
    );
    for (const activity of sourceProfileActivity) {
      await queryRunner.query(`DELETE FROM "profile_activity" WHERE "id"=$1`, [
        activity.id,
      ]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns("profile_activity", [
      "fiscalYearId",
      "__fiscalYearId__",
    ]);
  }
}
