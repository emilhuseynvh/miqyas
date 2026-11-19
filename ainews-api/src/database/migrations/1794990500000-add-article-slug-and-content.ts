import type { MigrationInterface, QueryRunner } from 'typeorm';
import { articleSlug } from '../../common/slug.js';

const BATCH = 2000;

export class AddArticleSlugAndContent1794990500000 implements MigrationInterface {
  name = 'AddArticleSlugAndContent1794990500000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "articles"
        ADD "slug" varchar(100),
        ADD "content" text,
        ADD "content_extracted_at" timestamptz
    `);

    for (;;) {
      const rows: { id: string; title: string; url: string }[] = await queryRunner.query(
        `SELECT "id", "title", "url" FROM "articles" WHERE "slug" IS NULL LIMIT ${BATCH}`,
      );
      if (rows.length === 0) break;
      await queryRunner.query(
        `UPDATE "articles" AS a SET "slug" = v.slug
         FROM (SELECT unnest($1::uuid[]) AS id, unnest($2::text[]) AS slug) AS v
         WHERE a.id = v.id`,
        [rows.map((r) => r.id), rows.map((r) => articleSlug(r.title, r.url))],
      );
    }

    await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "slug" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "articles" ADD CONSTRAINT "uq_articles_slug" UNIQUE ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_articles_content_pending" ON "articles" ("published_at") WHERE "content_extracted_at" IS NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_articles_content_pending"`);
    await queryRunner.query(`
      ALTER TABLE "articles"
        DROP CONSTRAINT "uq_articles_slug",
        DROP COLUMN "slug",
        DROP COLUMN "content",
        DROP COLUMN "content_extracted_at"
    `);
  }
}
