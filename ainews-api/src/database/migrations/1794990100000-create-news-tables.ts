import type { MigrationInterface, QueryRunner } from 'typeorm';

const categories: [string, string][] = [
  ['siyaset', 'Siyasət'],
  ['iqtisadiyyat', 'İqtisadiyyat'],
  ['texnologiya', 'Texnologiya'],
  ['suni-intellekt', 'Süni intellekt'],
  ['elm', 'Elm'],
  ['enerji', 'Enerji'],
  ['region', 'Region'],
  ['idman', 'İdman'],
];

export class CreateNewsTables1794990100000 implements MigrationInterface {
  name = 'CreateNewsTables1794990100000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" smallserial NOT NULL,
        "slug" varchar(50) NOT NULL,
        "name" varchar(100) NOT NULL,
        "sort_order" smallint NOT NULL DEFAULT 0,
        CONSTRAINT "pk_categories" PRIMARY KEY ("id"),
        CONSTRAINT "uq_categories_slug" UNIQUE ("slug")
      )
    `);

    const values = categories.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`);
    await queryRunner.query(
      `INSERT INTO "categories" ("slug", "name", "sort_order") VALUES ${values.join(', ')}`,
      categories.flatMap(([slug, name], i) => [slug, name, i]),
    );

    await queryRunner.query(
      `CREATE TYPE "source_status" AS ENUM ('pending', 'healthy', 'failing', 'no_feed')`,
    );
    await queryRunner.query(`
      CREATE TABLE "sources" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(200) NOT NULL,
        "site_url" varchar(500) NOT NULL,
        "feed_url" varchar(1000),
        "kind" varchar(100),
        "language" varchar(8) NOT NULL DEFAULT 'az',
        "is_active" boolean NOT NULL DEFAULT true,
        "status" "source_status" NOT NULL DEFAULT 'pending',
        "default_category_id" smallint,
        "last_fetched_at" timestamptz,
        "last_success_at" timestamptz,
        "last_error" text,
        "consecutive_failures" integer NOT NULL DEFAULT 0,
        "last_item_count" integer NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_sources" PRIMARY KEY ("id"),
        CONSTRAINT "uq_sources_site_url" UNIQUE ("site_url"),
        CONSTRAINT "fk_sources_default_category" FOREIGN KEY ("default_category_id")
          REFERENCES "categories" ("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "articles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "source_id" uuid NOT NULL,
        "category_id" smallint,
        "title" varchar(500) NOT NULL,
        "url" text NOT NULL,
        "summary" text,
        "image_url" text,
        "author" varchar(200),
        "feed_categories" text[] NOT NULL DEFAULT '{}',
        "published_at" timestamptz,
        "fetched_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_articles" PRIMARY KEY ("id"),
        CONSTRAINT "uq_articles_url" UNIQUE ("url"),
        CONSTRAINT "fk_articles_source" FOREIGN KEY ("source_id")
          REFERENCES "sources" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_articles_category" FOREIGN KEY ("category_id")
          REFERENCES "categories" ("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_articles_published_at" ON "articles" ("published_at")`,
    );
    await queryRunner.query(`CREATE INDEX "idx_articles_source_id" ON "articles" ("source_id")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "articles"`);
    await queryRunner.query(`DROP TABLE "sources"`);
    await queryRunner.query(`DROP TYPE "source_status"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
