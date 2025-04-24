import { Options } from '@mikro-orm/postgresql'; // korrekt type herfra
import { User } from 'src/users/entities/user.entity';
import { Document } from 'src/document/entities/document.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const config: Options = {
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  dbName: process.env.POSTGRES_DB,
  entities: [User, Document],
  migrations: {
    path: './migrations', // eller 'dist/migrations' i prod
    pathTs: './migrations',
    tableName: 'migrations',
  },
  debug: process.env.NODE_ENV !== 'production',
};

export default config;
