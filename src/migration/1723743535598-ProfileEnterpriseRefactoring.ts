import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class ProfileEnterpriseRefactoring1723743535598
  implements MigrationInterface
{
  name = "ProfileEnterpriseRefactoring1723743535598";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("profile_enterprise", true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("fiscal_year_enterprise", true);
    await queryRunner.createTable(
      new Table({
        name: "profile_enterprise",
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
            name: "amount",
            type: "numeric(19,2)",
            default: 0,
            isNullable: true,
          },
          {
            name: "import",
            type: "numeric(19,2)",
            default: 0,
            isNullable: true,
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
      "profile_enterprise",
      new TableColumn({
        name: "profileId",
        type: "int",
      })
    );
    await queryRunner.createForeignKey(
      "profile_enterprise",
      new TableForeignKey({
        columnNames: ["profileId"],
        referencedColumnNames: ["id"],
        referencedTableName: "profile",
      })
    );
  }
}
