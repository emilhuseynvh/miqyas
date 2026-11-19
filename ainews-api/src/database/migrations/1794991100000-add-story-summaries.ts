import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStorySummaries1794991100000 implements MigrationInterface {
  name = 'AddStorySummaries1794991100000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "stories"
        ADD "summary_title" varchar(200),
        ADD "summary" text,
        ADD "summary_model" varchar(80),
        ADD "summarized_at" timestamptz,
        ADD "summary_attempts" smallint NOT NULL DEFAULT 0
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_stories_summarized_at" ON "stories" ("summarized_at") WHERE "summarized_at" IS NOT NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_stories_summarized_at"`);
    await queryRunner.query(`
      ALTER TABLE "stories"
        DROP COLUMN "summary_title",
        DROP COLUMN "summary",
        DROP COLUMN "summary_model",
        DROP COLUMN "summarized_at",
        DROP COLUMN "summary_attempts"
    `);
  }
}
