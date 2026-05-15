import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBookingStatusPaid1778482600000 implements MigrationInterface {
  name = 'AddBookingStatusPaid1778482600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TYPE "bookings_status_enum" ADD VALUE 'paid';
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
  }

  public async down(): Promise<void> {
    /* PostgreSQL không hỗ trợ xóa giá trị enum an toàn */
  }
}
