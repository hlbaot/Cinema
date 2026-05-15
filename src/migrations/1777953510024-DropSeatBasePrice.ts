import { MigrationInterface, QueryRunner } from "typeorm";

export class DropSeatBasePrice1777953510024 implements MigrationInterface {
    name = 'DropSeatBasePrice1777953510024'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "seats" DROP COLUMN "base_price"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "seats" ADD "base_price" numeric(10,2) NOT NULL DEFAULT '0'`);
    }
}
