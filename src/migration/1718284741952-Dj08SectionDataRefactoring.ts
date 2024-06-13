import { MigrationInterface, QueryRunner } from "typeorm";

export class Dj08SectionDataRefactoring1718284741952 implements MigrationInterface {
    name = 'Dj08SectionDataRefactoring1718284741952'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "dj08_section_data" WHERE "is_rectification" = true`);
        await queryRunner.query(`UPDATE public.dj08_section_data SET is_rectification = true::boolean WHERE "is_rectification" = false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE public.dj08_section_data SET is_rectification = false::boolean WHERE "is_rectification" = true`);
    }

}
