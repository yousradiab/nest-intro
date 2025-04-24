import { Migration } from '@mikro-orm/migrations';

export class Migration20250424133832 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "document" alter column "content" type text using ("content"::text);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "document" alter column "content" type varchar(255) using ("content"::varchar(255));`);
  }

}
