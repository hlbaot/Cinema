import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketsTable1778482800000 implements MigrationInterface {
  name = 'CreateTicketsTable1778482800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."tickets_status_enum" AS ENUM('valid', 'used', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE "tickets" (
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "booking_id" uuid NOT NULL,
        "ticket_code" character varying(50) NOT NULL,
        "qr_code_url" character varying(512),
        "status" "public"."tickets_status_enum" NOT NULL DEFAULT 'valid',
        "checked_in_at" TIMESTAMP,
        CONSTRAINT "PK_tickets_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tickets_ticket_code" UNIQUE ("ticket_code"),
        CONSTRAINT "FK_tickets_booking_id" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_tickets_booking_id" ON "tickets" ("booking_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_tickets_status" ON "tickets" ("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tickets"`);
    await queryRunner.query(`DROP TYPE "public"."tickets_status_enum"`);
  }
}
