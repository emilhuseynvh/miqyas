import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRecommendationSignals1794990700000 implements MigrationInterface {
  name = 'AddRecommendationSignals1794990700000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "hidden_articles" (
        "user_id" uuid NOT NULL,
        "article_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_hidden_articles" PRIMARY KEY ("user_id", "article_id"),
        CONSTRAINT "fk_hidden_articles_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_hidden_articles_article" FOREIGN KEY ("article_id") REFERENCES "articles" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "user_interests" (
        "user_id" uuid NOT NULL,
        "category_id" smallint NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_user_interests" PRIMARY KEY ("user_id", "category_id"),
        CONSTRAINT "fk_user_interests_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_user_interests_category" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_articles_feed_candidates" ON "articles" ("published_at" DESC) WHERE "image_url" IS NOT NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_articles_feed_candidates"`);
    await queryRunner.query(`DROP TABLE "user_interests"`);
    await queryRunner.query(`DROP TABLE "hidden_articles"`);
  }
}
