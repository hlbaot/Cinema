import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentProviderPayos1778482500000 implements MigrationInterface {
  name = 'AddPaymentProviderPayos1778482500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TYPE "payments_provider_enum" ADD VALUE 'payos';
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
  }

  public async down(): Promise<void> {
    /* PostgreSQL không hỗ trợ xóa giá trị enum an toàn */
  }
}
