import type { MigrationInterface, QueryRunner } from 'typeorm';
import { slugify } from '../../common/slug.js';

export class AddEngagement1794990600000 implements MigrationInterface {
  name = 'AddEngagement1794990600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "articles"
        ADD "view_count" integer NOT NULL DEFAULT 0,
        ADD "like_count" integer NOT NULL DEFAULT 0,
        ADD "dislike_count" integer NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      CREATE TABLE "article_reactions" (
        "user_id" uuid NOT NULL,
        "article_id" uuid NOT NULL,
        "value" smallint NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_article_reactions" PRIMARY KEY ("user_id", "article_id"),
        CONSTRAINT "chk_article_reactions_value" CHECK ("value" IN (-1, 1)),
        CONSTRAINT "fk_article_reactions_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_article_reactions_article" FOREIGN KEY ("article_id") REFERENCES "articles" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "saved_articles" (
        "user_id" uuid NOT NULL,
        "article_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_saved_articles" PRIMARY KEY ("user_id", "article_id"),
        CONSTRAINT "fk_saved_articles_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_saved_articles_article" FOREIGN KEY ("article_id") REFERENCES "articles" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_saved_articles_user_created" ON "saved_articles" ("user_id", "created_at" DESC)`,
    );

    await queryRunner.query(`
      CREATE TABLE "reading_history" (
        "user_id" uuid NOT NULL,
        "article_id" uuid NOT NULL,
        "read_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_reading_history" PRIMARY KEY ("user_id", "article_id"),
        CONSTRAINT "fk_reading_history_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_reading_history_article" FOREIGN KEY ("article_id") REFERENCES "articles" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_reading_history_user_read" ON "reading_history" ("user_id", "read_at" DESC)`,
    );

    await queryRunner.query(`ALTER TABLE "sources" ADD "slug" varchar(120)`);
    const sources: { id: string; name: string }[] = await queryRunner.query(
      `SELECT "id", "name" FROM "sources" ORDER BY "created_at"`,
    );
    const taken = new Set<string>();
    for (const source of sources) {
      const base = slugify(source.name) || 'menbe';
      let slug = base;
      for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
      taken.add(slug);
      await queryRunner.query(`UPDATE "sources" SET "slug" = $1 WHERE "id" = $2`, [
        slug,
        source.id,
      ]);
    }
    await queryRunner.query(`ALTER TABLE "sources" ALTER COLUMN "slug" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "sources" ADD CONSTRAINT "uq_sources_slug" UNIQUE ("slug")`,
    );

    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
    await queryRunner.query(
      `CREATE INDEX "idx_articles_title_trgm" ON "articles" USING gin ("title" gin_trgm_ops)`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_articles_title_trgm"`);
    await queryRunner.query(
      `ALTER TABLE "sources" DROP CONSTRAINT "uq_sources_slug", DROP COLUMN "slug"`,
    );
    await queryRunner.query(`DROP TABLE "reading_history"`);
    await queryRunner.query(`DROP TABLE "saved_articles"`);
    await queryRunner.query(`DROP TABLE "article_reactions"`);
    await queryRunner.query(`
      ALTER TABLE "articles"
        DROP COLUMN "view_count",
        DROP COLUMN "like_count",
        DROP COLUMN "dislike_count"
    `);
  }
}
