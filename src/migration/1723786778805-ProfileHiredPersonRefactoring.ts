import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class ProfileHiredPersonRefactoring1723786778805
  implements MigrationInterface
{
  name = "ProfileHiredPersonRefactoring1723786778805";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("profile_hired_person", true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("profile_hired_person", true);
    await queryRunner.createTable(
      new Table({
        name: "profile_hired_person",
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
            name: "date_start",
            type: "timestamp without time zone",
            default: "now()",
          },
          {
            name: "date_end",
            type: "timestamp without time zone",
            default: "now()",
          },
          {
            name: "import",
            type: "numeric(19,2)",
            default: 0,
          },
          {
            name: "__profileId__",
            type: "integer",
            isNullable: true,
          },
        ],
      }),
      true
    );
    await queryRunner.addColumn(
      "profile_hired_person",
      new TableColumn({
        name: "hiredPersonId",
        type: "int",
      })
    );
    await queryRunner.addColumn(
      "profile_hired_person",
      new TableColumn({
        name: "profileId",
        type: "int",
      })
    );
    await queryRunner.createForeignKey(
      "profile_hired_person",
      new TableForeignKey({
        columnNames: ["profileId"],
        referencedColumnNames: ["id"],
        referencedTableName: "profile",
      })
    );
    await queryRunner.createForeignKey(
      "profile_hired_person",
      new TableForeignKey({
        columnNames: ["hiredPersonId"],
        referencedColumnNames: ["id"],
        referencedTableName: "hired_person",
      })
    );
  }
}
