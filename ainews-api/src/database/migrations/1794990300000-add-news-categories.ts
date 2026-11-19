import type { MigrationInterface, QueryRunner } from 'typeorm';

const order: [string, string, number][] = [
  ['siyaset', 'Siyasət', 0],
  ['dunya', 'Dünya', 1],
  ['iqtisadiyyat', 'İqtisadiyyat', 2],
  ['cemiyyet', 'Cəmiyyət', 3],
  ['hadise', 'Hadisə', 4],
  ['idman', 'İdman', 5],
  ['texnologiya', 'Texnologiya', 6],
  ['suni-intellekt', 'Süni intellekt', 7],
  ['elm', 'Elm və təhsil', 8],
  ['enerji', 'Enerji', 9],
  ['medeniyyet', 'Mədəniyyət', 10],
  ['region', 'Region', 11],
];

export class AddNewsCategories1794990300000 implements MigrationInterface {
  name = 'AddNewsCategories1794990300000';

  async up(queryRunner: QueryRunner): Promise<void> {
    for (const [slug, name, sortOrder] of order) {
      await queryRunner.query(
        `INSERT INTO "categories" ("slug", "name", "sort_order") VALUES ($1, $2, $3)
         ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name", "sort_order" = EXCLUDED."sort_order"`,
        [slug, name, sortOrder],
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "categories" WHERE "slug" IN ('dunya', 'cemiyyet', 'hadise', 'medeniyyet')`,
    );
    await queryRunner.query(`UPDATE "categories" SET "name" = 'Elm' WHERE "slug" = 'elm'`);
  }
}
