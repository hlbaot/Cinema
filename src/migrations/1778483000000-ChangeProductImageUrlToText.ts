import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeProductImageUrlToText1778483000000 implements MigrationInterface {
  name = 'ChangeProductImageUrlToText1778483000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "image_url" text
    `);
    await queryRunner.query(`
      ALTER TABLE "products"
      ALTER COLUMN "image_url" TYPE text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products"
      ALTER COLUMN "image_url" TYPE character varying(255)
    `);
  }
}
