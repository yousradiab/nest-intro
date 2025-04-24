import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';
import { v4 } from 'uuid';

export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest',
}
@Entity()
export class User {
  @PrimaryKey({ type: 'uuid' })
  uuid = v4();

  @Property()
  name!: string;

  @Property({ unique: true })
  email: string;
  @Property()
  password: string;
  @Enum({
    items: () => UserRole,
    nativeEnumName: 'user_role',
    default: UserRole.MEMBER,
  })
  role: UserRole;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
