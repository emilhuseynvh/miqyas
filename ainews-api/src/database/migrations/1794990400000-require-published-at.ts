import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RequirePublishedAt1794990400000 implements MigrationInterface {
  name = 'RequirePublishedAt1794990400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "articles" SET "published_at" = "fetched_at" WHERE "published_at" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" ALTER COLUMN "published_at" SET DEFAULT now(), ALTER COLUMN "published_at" SET NOT NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" ALTER COLUMN "published_at" DROP NOT NULL, ALTER COLUMN "published_at" DROP DEFAULT`,
    );
  }
}
