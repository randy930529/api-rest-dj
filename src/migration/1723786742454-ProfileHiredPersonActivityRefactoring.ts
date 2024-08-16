import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class ProfileHiredPersonActivityRefactoring1723786742454
  implements MigrationInterface
{
  name = "ProfileHiredPersonActivityRefactoring1723786742454";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("profile_hired_person_activity", true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("profile_hired_person_activity", true);
    await queryRunner.createTable(
      new Table({
        name: "profile_hired_person_activity",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
          },
          {
            name: "created_at",
            type: "timestamp without time zone",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp without time zone",
            default: "now()",
          },
          {
            name: "annual_cost",
            type: "numeric(19,2)",
            default: 0,
          },
        ],
      }),
      true
    );
    await queryRunner.addColumn(
      "profile_hired_person_activity",
      new TableColumn({
        name: "profileHiredPersonId",
        type: "int",
      })
    );
    await queryRunner.addColumn(
      "profile_hired_person_activity",
      new TableColumn({
        name: "profileActivityId",
        type: "int",
      })
    );
    await queryRunner.createForeignKey(
      "profile_hired_person_activity",
      new TableForeignKey({
        columnNames: ["profileHiredPersonId"],
        referencedColumnNames: ["id"],
        referencedTableName: "profile_hired_person",
      })
    );
    await queryRunner.createForeignKey(
      "profile_hired_person_activity",
      new TableForeignKey({
        columnNames: ["profileActivityId"],
        referencedColumnNames: ["id"],
        referencedTableName: "profile_activity",
      })
    );
  }
}
