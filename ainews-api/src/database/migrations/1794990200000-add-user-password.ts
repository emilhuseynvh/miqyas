import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPassword1794990200000 implements MigrationInterface {
  name = 'AddUserPassword1794990200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "password_hash" varchar(255)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_hash"`);
  }
}
