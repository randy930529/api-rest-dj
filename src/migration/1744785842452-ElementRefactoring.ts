import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

type NewDataElementType = {
  debitar_account_element: boolean;
  use_box_bank: boolean;
  othor_account: string | number | null;
};
const _new_data_elements: Map<string, NewDataElementType> = new Map([
  [
    "pdmp",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "pdmv",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "pdcb",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "pdee",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "pdrp",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "pdrc",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "pdri",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "pdgc",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "pdog",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "pdgt",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "pdgt",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "plgt",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "pdgt",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "pdgt",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "ddgt",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "ddod",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "ddod",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "ddod",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "niei",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "niss",
    {
      debitar_account_element: true,
      use_box_bank: false,
      othor_account: "500",
    },
  ],
  [
    "tpsv",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "tpsv",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "tpft",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "tpdc",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "tpan",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "tpcs",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "tpss",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "trss",
    {
      debitar_account_element: true,
      use_box_bank: false,
      othor_account: "500",
    },
  ],
  [
    "emty",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "tpot",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "tprz",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "tpcm",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "iggv",
    {
      debitar_account_element: false,
      use_box_bank: false,
      othor_account: null,
    },
  ],
  [
    "igex",
    {
      debitar_account_element: false,
      use_box_bank: false,
      othor_account: null,
    },
  ],
  [
    "emty",
    {
      debitar_account_element: false,
      use_box_bank: false,
      othor_account: null,
    },
  ],
  [
    "omap",
    {
      debitar_account_element: false,
      use_box_bank: false,
      othor_account: null,
    },
  ],
  [
    "omlp",
    {
      debitar_account_element: false,
      use_box_bank: false,
      othor_account: null,
    },
  ],
  [
    "omcp",
    {
      debitar_account_element: false,
      use_box_bank: false,
      othor_account: null,
    },
  ],
  [
    "omcb",
    {
      debitar_account_element: false,
      use_box_bank: false,
      othor_account: "110",
    },
  ],
  [
    "ombc",
    {
      debitar_account_element: false,
      use_box_bank: false,
      othor_account: "100",
    },
  ],
  [
    "omcl",
    {
      debitar_account_element: true,
      use_box_bank: false,
      othor_account: "520",
    },
  ],
  [
    "omlc",
    {
      debitar_account_element: true,
      use_box_bank: false,
      othor_account: "470",
    },
  ],
  [
    "ompp",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "emty",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "omrt",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "onex",
    {
      debitar_account_element: false,
      use_box_bank: false,
      othor_account: null,
    },
  ],
  [
    "onda",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
  [
    "onfp",
    {
      debitar_account_element: false,
      use_box_bank: false,
      othor_account: null,
    },
  ],
  [
    "onpa",
    {
      debitar_account_element: false,
      use_box_bank: false,
      othor_account: null,
    },
  ],
  [
    "onrt",
    {
      debitar_account_element: true,
      use_box_bank: false,
      othor_account: "900-10",
    },
  ],
  [
    "onbn",
    {
      debitar_account_element: false,
      use_box_bank: false,
      othor_account: null,
    },
  ],
  [
    "onde",
    { debitar_account_element: true, use_box_bank: true, othor_account: null },
  ],
]);

export class ElementRefactoring1744785842452 implements MigrationInterface {
  name = "ElementRefactoring1744785842452";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "element" ADD "debitar_account_element" boolean NOT NULL DEFAULT true`
    );
    await queryRunner.query(
      `ALTER TABLE "element" ADD "use_box_bank" boolean NOT NULL DEFAULT true`
    );
    await queryRunner.query(
      `ALTER TABLE "element" ADD "othorAccountId" integer`
    );
    await queryRunner.createForeignKey(
      "element",
      new TableForeignKey({
        columnNames: ["othorAccountId"],
        referencedColumnNames: ["id"],
        referencedTableName: "account",
        onDelete: "NO ACTION",
      })
    );

    const othorAccounts: {
      id: number;
      code: number;
    }[] = await queryRunner.query(
      `SELECT "Account"."id" AS "id", "Account"."code" AS "code" FROM "account" "Account" WHERE "code" IN ('500', '110', '100', '520', '470', '900-10')`
    );

    const elements: {
      id: number;
      group: string;
    }[] = await queryRunner.query(
      `SELECT "Element"."id" AS "id", "Element"."group" AS "group" FROM "element" "Element" ORDER BY id ASC`
    );

    for (const { id, group } of elements) {
      const _set = _new_data_elements.get(group?.trim());
      if (_set) {
        const othor_account =
          _set.othor_account &&
          othorAccounts.find(({ code }) => code === _set.othor_account)?.id;
        await this.upElement(queryRunner, id, { ..._set, othor_account });
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("element");
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("othorAccountId") !== -1
    );
    await queryRunner.dropForeignKey("element", foreignKey);
    await queryRunner.query(
      `ALTER TABLE "element" DROP COLUMN "debitar_account_element", DROP COLUMN "use_box_bank", DROP COLUMN "othorAccountId"`
    );
  }

  private async upElement(
    qr: QueryRunner,
    id: number,
    data: NewDataElementType
  ): Promise<void> {
    await qr.query(
      `UPDATE "element" SET "debitar_account_element"=$2, "use_box_bank"=$3, "othorAccountId"=$4 WHERE "id"=$1;`,
      [id, data.debitar_account_element, data.use_box_bank, data.othor_account]
    );
  }
}
