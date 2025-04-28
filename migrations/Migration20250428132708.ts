import { Migration } from '@mikro-orm/migrations';

export class Migration20250428132708 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "document_chunk" ("uuid" uuid not null, "content" text not null, "embedding" vector not null, "document_uuid" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "document_chunk_pkey" primary key ("uuid"));`);

    this.addSql(`alter table "document_chunk" add constraint "document_chunk_document_uuid_foreign" foreign key ("document_uuid") references "document" ("uuid") on update cascade;`);

    this.addSql(`alter table "document" drop column "content", drop column "embedding";`);

    this.addSql(`alter table "document" add column "num_pages" int not null, add column "title" varchar(255) null, add column "author" varchar(255) null, add column "subject" varchar(255) null, add column "keywords" varchar(255) null, add column "creator" varchar(255) null, add column "producer" varchar(255) null, add column "creation_date" varchar(255) null, add column "mod_date" varchar(255) null;`);
    this.addSql(`alter table "document" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "document" alter column "created_at" set default now();`);
    this.addSql(`alter table "document" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "document" alter column "updated_at" set default now();`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "document_chunk" cascade;`);

    this.addSql(`alter table "document" drop column "num_pages", drop column "title", drop column "author", drop column "subject", drop column "keywords", drop column "creator", drop column "producer", drop column "creation_date", drop column "mod_date";`);

    this.addSql(`alter table "document" add column "content" text not null, add column "embedding" vector not null;`);
    this.addSql(`alter table "document" alter column "created_at" drop default;`);
    this.addSql(`alter table "document" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "document" alter column "updated_at" drop default;`);
    this.addSql(`alter table "document" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
  }

}
