import type { MigrationInterface, QueryRunner } from 'typeorm';
import { isJunkTitle } from '../../common/junk.js';

const BATCH = 5000;

export class AddArticleJunkFlag1794991200000 implements MigrationInterface {
  name = 'AddArticleJunkFlag1794991200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "articles" ADD "is_junk" boolean NOT NULL DEFAULT false`);

    let offset = 0;
    for (;;) {
      const rows: { id: string; title: string }[] = await queryRunner.query(
        `SELECT "id", "title" FROM "articles" ORDER BY "id" LIMIT ${BATCH} OFFSET ${offset}`,
      );
      if (rows.length === 0) break;
      const junk = rows.filter((row) => isJunkTitle(row.title)).map((row) => row.id);
      if (junk.length > 0) {
        await queryRunner.query(`UPDATE "articles" SET "is_junk" = true WHERE "id" = ANY($1::uuid[])`, [junk]);
      }
      offset += BATCH;
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "is_junk"`);
  }
}
