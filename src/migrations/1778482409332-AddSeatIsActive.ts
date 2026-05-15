import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSeatIsActive1778482409332 implements MigrationInterface {
    name = 'AddSeatIsActive1778482409332'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "seats" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`CREATE TYPE "public"."showtimes_schedule_type_enum" AS ENUM('auto', 'manual')`);
        await queryRunner.query(`ALTER TABLE "showtimes" ADD "schedule_type" "public"."showtimes_schedule_type_enum" NOT NULL DEFAULT 'manual'`);
        await queryRunner.query(`ALTER TABLE "movies" DROP COLUMN "supported_formats"`);
        await queryRunner.query(`ALTER TABLE "movies" ADD "supported_formats" text`);
        await queryRunner.query(`CREATE INDEX "IDX_e2835526d289f28ebe67e6bfff" ON "showtimes" ("schedule_type") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_e2835526d289f28ebe67e6bfff"`);
        await queryRunner.query(`ALTER TABLE "movies" DROP COLUMN "supported_formats"`);
        await queryRunner.query(`ALTER TABLE "movies" ADD "supported_formats" character varying`);
        await queryRunner.query(`ALTER TABLE "showtimes" DROP COLUMN "schedule_type"`);
        await queryRunner.query(`DROP TYPE "public"."showtimes_schedule_type_enum"`);
        await queryRunner.query(`ALTER TABLE "seats" DROP COLUMN "is_active"`);
    }

}
