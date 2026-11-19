import type { MigrationInterface, QueryRunner } from 'typeorm';
import { titleKey } from '../../common/title-key.js';

const BATCH = 2000;

export class AddStories1794991000000 implements MigrationInterface {
  name = 'AddStories1794991000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "stories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "primary_article_id" uuid,
        "article_count" integer NOT NULL DEFAULT 1,
        "source_count" integer NOT NULL DEFAULT 1,
        "first_published_at" timestamptz NOT NULL,
        "last_published_at" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_stories" PRIMARY KEY ("id"),
        CONSTRAINT "fk_stories_primary_article" FOREIGN KEY ("primary_article_id")
          REFERENCES "articles" ("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "articles"
        ADD "story_id" uuid,
        ADD "title_key" text,
        ADD "clustered_at" timestamptz,
        ADD CONSTRAINT "fk_articles_story" FOREIGN KEY ("story_id") REFERENCES "stories" ("id") ON DELETE SET NULL
    `);

    for (;;) {
      const rows: { id: string; title: string }[] = await queryRunner.query(
        `SELECT "id", "title" FROM "articles" WHERE "title_key" IS NULL LIMIT ${BATCH}`,
      );
      if (rows.length === 0) break;
      await queryRunner.query(
        `UPDATE "articles" AS a SET "title_key" = v.key
           FROM (SELECT unnest($1::uuid[]) AS id, unnest($2::text[]) AS key) AS v
          WHERE a.id = v.id`,
        [rows.map((r) => r.id), rows.map((r) => titleKey(r.title))],
      );
    }

    await queryRunner.query(
      `UPDATE "articles" SET "clustered_at" = now() WHERE "published_at" < now() - interval '48 hours'`,
    );
    await queryRunner.query(`CREATE INDEX "idx_articles_story_id" ON "articles" ("story_id")`);
    await queryRunner.query(
      `CREATE INDEX "idx_articles_title_key_trgm" ON "articles" USING gin ("title_key" gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_articles_unclustered" ON "articles" ("published_at") WHERE "clustered_at" IS NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_articles_unclustered"`);
    await queryRunner.query(`DROP INDEX "idx_articles_title_key_trgm"`);
    await queryRunner.query(`DROP INDEX "idx_articles_story_id"`);
    await queryRunner.query(`
      ALTER TABLE "articles"
        DROP CONSTRAINT "fk_articles_story",
        DROP COLUMN "story_id",
        DROP COLUMN "title_key",
        DROP COLUMN "clustered_at"
    `);
    await queryRunner.query(`DROP TABLE "stories"`);
  }
}
