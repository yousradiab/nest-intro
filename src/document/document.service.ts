import { Injectable } from '@nestjs/common';
import { Document, Vector } from './entities/document.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: EntityRepository<Document>,
  ) {}

  async saveDocument(content: string, embedding: Vector) {
    const doc = this.documentRepository.create({
      content,
      embedding,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.documentRepository.getEntityManager().persistAndFlush(document);

    return doc;
  }

  // async searchSimilarDocuments(
  //   embedding: number[],
  //   limit = 5,
  // ): Promise<Document> {
  //   return this.dataSource.query(
  //     `SELECT *, embedding <=> $1 AS similarity
  //      FROM document
  //      ORDER BY similarity ASC
  //      LIMIT $2`,
  //     [embedding, limit],
  //   );
  // }
}
