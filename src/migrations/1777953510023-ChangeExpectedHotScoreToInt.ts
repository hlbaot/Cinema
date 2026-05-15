import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeExpectedHotScoreToInt1777953510023 implements MigrationInterface {
    name = 'ChangeExpectedHotScoreToInt1777953510023'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movies" ALTER COLUMN "expected_hot_score" TYPE integer USING "expected_hot_score"::integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movies" ALTER COLUMN "expected_hot_score" TYPE numeric(5,2) USING "expected_hot_score"::numeric(5,2)`);
    }
}
