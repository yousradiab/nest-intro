import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { DocumentModule } from './document/document.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RagService } from './rag/rag.service';
import { OpenaiModule } from './rag/rag.module';
import MIKROORM_CONFIG from './database/mikro-orm.config';

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    DocumentModule,
    MikroOrmModule.forRoot(MIKROORM_CONFIG),
    OpenaiModule,
  ],
  controllers: [AppController],
  providers: [AppService, RagService],
})
export class AppModule {}
