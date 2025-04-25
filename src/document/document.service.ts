/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { Document, Vector } from './entities/document.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { OpenaiService } from 'src/openai/openai.service';
import * as pdfParse from 'pdf-parse';

type PDFData = {
  text: string;
  numPages: number;
};

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: EntityRepository<Document>,
    private readonly openAiService: OpenaiService,
  ) {}

  async findAll() {
    return this.documentRepository.findAll();
  }

  async genereateEmbedding(text: string): Promise<Vector> {
    const response = await this.openAiService.generateEmbedding(text);
    console.log('Embedding response', response);
    return response;
  }

  async readPDF(file: Express.Multer.File): Promise<PDFData> {
    const pdfData = await pdfParse(file.buffer);
    const pdf: PDFData = {
      text: pdfData.text,
      numPages: pdfData.numpages,
    };
    console.log(pdf);
    return pdf;
  }
  private semanticChunking(text: string): string[] {
    // Option 1: Using natural language boundaries
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

    // Merge short paragraphs and split long ones based on semantic coherence
    const chunks: string[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      // If adding this paragraph would make chunk too long, save current chunk and start new one
      if (
        currentChunk.length + paragraph.length > 1000 &&
        currentChunk.length > 0
      ) {
        chunks.push(currentChunk);
        currentChunk = paragraph;
      } else {
        currentChunk =
          currentChunk.length > 0
            ? `${currentChunk}\n\n${paragraph}`
            : paragraph;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  async processPDF(file: Express.Multer.File): Promise<void> {
    const pdfData = await this.readPDF(file);
    const text = pdfData.text;
    const chunks = this.semanticChunking(text);
    for (const chunk of chunks) {
      const embedding = await this.genereateEmbedding(chunk);
      const document = new Document();
      document.content = chunk;
      document.embedding = embedding;
      this.documentRepository.getEntityManager().persist(document);
    }
    await this.documentRepository.getEntityManager().flush();
  }

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
