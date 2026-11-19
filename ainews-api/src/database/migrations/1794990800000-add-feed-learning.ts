import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeedLearning1794990800000 implements MigrationInterface {
  name = 'AddFeedLearning1794990800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "feed_impressions" (
        "user_id" uuid NOT NULL,
        "article_id" uuid NOT NULL,
        "shown_count" integer NOT NULL DEFAULT 1,
        "first_shown_at" timestamptz NOT NULL DEFAULT now(),
        "last_shown_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_feed_impressions" PRIMARY KEY ("user_id", "article_id"),
        CONSTRAINT "fk_feed_impressions_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_feed_impressions_article" FOREIGN KEY ("article_id") REFERENCES "articles" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "reading_history" ADD "from_exploration" boolean NOT NULL DEFAULT false`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "reading_history" DROP COLUMN "from_exploration"`);
    await queryRunner.query(`DROP TABLE "feed_impressions"`);
  }
}
