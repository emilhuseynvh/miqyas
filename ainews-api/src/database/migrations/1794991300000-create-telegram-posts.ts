import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTelegramPosts1794991300000 implements MigrationInterface {
  name = 'CreateTelegramPosts1794991300000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "telegram_posts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "kind" varchar(20) NOT NULL,
        "ref" varchar(64) NOT NULL,
        "message_id" integer,
        "posted_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_telegram_posts" PRIMARY KEY ("id"),
        CONSTRAINT "uq_telegram_posts_kind_ref" UNIQUE ("kind", "ref")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_telegram_posts_posted_at" ON "telegram_posts" ("posted_at")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "telegram_posts"`);
  }
}
