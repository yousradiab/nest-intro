import { Migration } from '@mikro-orm/migrations';

export class Migration20250424133344 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create type "user_role" as enum ('admin', 'member', 'guest');`);
    this.addSql(`create table "document" ("uuid" uuid not null, "content" varchar(255) not null, "embedding" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "document_pkey" primary key ("uuid"));`);

    this.addSql(`create table "user" ("uuid" uuid not null, "name" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, "role" "user_role" not null default 'member', "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "user_pkey" primary key ("uuid"));`);
    this.addSql(`alter table "user" add constraint "user_email_unique" unique ("email");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "document" cascade;`);

    this.addSql(`drop table if exists "user" cascade;`);

    this.addSql(`drop type "user_role";`);
  }

}
