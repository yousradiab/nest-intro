import { Migration } from '@mikro-orm/migrations';

export class Migration20250424142812 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create extension if not exists "vector";`);
    this.addSql(
      `alter table "document" alter column "embedding" type vector using ("embedding"::vector);`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "document" alter column "embedding" type varchar(255) using ("embedding"::varchar(255));`,
    );
  }
}
