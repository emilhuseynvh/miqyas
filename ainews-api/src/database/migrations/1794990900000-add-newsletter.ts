import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewsletter1794990900000 implements MigrationInterface {
  name = 'AddNewsletter1794990900000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "subscriber_status" AS ENUM ('pending', 'active', 'unsubscribed')`,
    );
    await queryRunner.query(`
      CREATE TABLE "subscribers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" varchar(320) NOT NULL,
        "status" "subscriber_status" NOT NULL DEFAULT 'pending',
        "confirm_token" uuid,
        "unsubscribe_token" uuid NOT NULL DEFAULT gen_random_uuid(),
        "confirmed_at" timestamptz,
        "unsubscribed_at" timestamptz,
        "last_sent_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_subscribers" PRIMARY KEY ("id"),
        CONSTRAINT "uq_subscribers_email" UNIQUE ("email"),
        CONSTRAINT "uq_subscribers_confirm_token" UNIQUE ("confirm_token"),
        CONSTRAINT "uq_subscribers_unsubscribe_token" UNIQUE ("unsubscribe_token")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_subscribers_active" ON "subscribers" ("last_sent_at") WHERE "status" = 'active'`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "subscribers"`);
    await queryRunner.query(`DROP TYPE "subscriber_status"`);
  }
}
