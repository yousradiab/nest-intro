import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MikroOrmModule } from '@mikro-orm/nestjs/mikro-orm.module';
import { User } from './entities/user.entity';

@Module({
  imports: [MikroOrmModule.forFeature([User])], // Sørg for at importere User med MikroOrmModule
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
