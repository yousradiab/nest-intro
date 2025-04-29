import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { Document } from './entities/document.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { OpenaiModule } from 'src/rag/rag.module';
import { DocumentChunk } from './entities/document-chunk.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Document, DocumentChunk]), OpenaiModule],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
