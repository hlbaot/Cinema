import { MigrationInterface, QueryRunner } from "typeorm";

export class SetSimpleSeatPrices1777953510025 implements MigrationInterface {
    name = 'SetSimpleSeatPrices1777953510025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "seats" SET "price_adjustment" = CASE WHEN "type" = 'couple' THEN 95000 ELSE 0 END`);
        await queryRunner.query(`UPDATE "showtimes" SET "base_price" = 55000`);
        await queryRunner.query(`
            UPDATE "showtime_seats" "ss"
            SET "price" = 55000 + CASE WHEN "seat"."type" = 'couple' THEN 95000 ELSE 0 END
            FROM "seats" "seat"
            WHERE "seat"."id" = "ss"."seat_id"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "seats" SET "price_adjustment" = CASE WHEN "type" = 'vip' THEN 20000 WHEN "type" = 'couple' THEN 50000 ELSE 0 END`);
        await queryRunner.query(`
            UPDATE "showtime_seats" "ss"
            SET "price" = "showtime"."base_price" + CASE WHEN "seat"."type" = 'vip' THEN 20000 WHEN "seat"."type" = 'couple' THEN 50000 ELSE 0 END
            FROM "seats" "seat", "showtimes" "showtime"
            WHERE "seat"."id" = "ss"."seat_id"
              AND "showtime"."id" = "ss"."showtime_id"
        `);
    }
}
