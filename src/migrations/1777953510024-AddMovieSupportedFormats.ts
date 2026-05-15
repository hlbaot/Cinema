import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Entity Movie.supported_formats (simple-array) — TypeORM lưu chuỗi phân tách bằng dấu phẩy.
 */
export class AddMovieSupportedFormats1777953510024 implements MigrationInterface {
  name = 'AddMovieSupportedFormats1777953510024';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "movies" ADD "supported_formats" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "movies" DROP COLUMN "supported_formats"`,
    );
  }
}
