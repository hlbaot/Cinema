import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentStatusSuccess1778482700000 implements MigrationInterface {
  name = 'AddPaymentStatusSuccess1778482700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(`ALTER TYPE "payments_status_enum" RENAME TO "payments_status_enum_old"`);
    await queryRunner.query(`CREATE TYPE "payments_status_enum" AS ENUM('pending', 'success', 'failed', 'refunded', 'cancelled')`);
    await queryRunner.query(`
      ALTER TABLE "payments"
      ALTER COLUMN "status" TYPE "payments_status_enum"
      USING (
        CASE
          WHEN "status"::text = 'paid' THEN 'success'
          ELSE "status"::text
        END
      )::"payments_status_enum"
    `);
    await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'pending'`);
    await queryRunner.query(`DROP TYPE "payments_status_enum_old"`);
  }

  public async down(): Promise<void> {
    /* Không đảo ngược: enum vẫn còn nhãn 'paid' nếu DB cũ */
  }
}
