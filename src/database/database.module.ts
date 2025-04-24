import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import mikroormConfig from './mikro-orm.config';

@Module({
  imports: [
    MikroOrmModule.forRoot(mikroormConfig),
    // andre moduler her
  ],
})
export class DatabaseModule {}
