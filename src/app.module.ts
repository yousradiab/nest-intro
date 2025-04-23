import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { DocumentModule } from './document/document.module';

@Module({
  imports: [UsersModule, DatabaseModule, DocumentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
