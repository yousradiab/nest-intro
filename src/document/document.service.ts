/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { Document, Vector } from './entities/document.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { OpenaiService } from 'src/openai/openai.service';
import * as pdfParse from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { DocumentChunk } from './entities/document-chunk.entity';

type PDFData = {
  text: string;
  numPages: number;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string; // (OBS: stavefejl i din entitet, se note nedenfor)
  modDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: EntityRepository<Document>,
    @InjectRepository(DocumentChunk)
    private readonly chunkRepository: EntityRepository<DocumentChunk>,
    private readonly openAiService: OpenaiService,
  ) {}

  async findAll() {
    return this.documentRepository.findAll();
  }

  async genereateEmbedding(text: string): Promise<Vector> {
    const response = await this.openAiService.generateEmbedding(text);
    return response;
  }

  async readPDF(file: Express.Multer.File): Promise<PDFData> {
    const pdfData = await pdfParse(file.buffer);
    const pdf: PDFData = {
      text: pdfData.text,
      numPages: pdfData.numpages,
      title: pdfData.info.Title,
      author: pdfData.info.Author,
      subject: pdfData.info.Subject,
      keywords: pdfData.info.Keywords,
      creator: pdfData.info.Producer,
      producer: pdfData.info.Creator,
      creationDate: pdfData.info.CreationDate,
      modDate: pdfData.info.ModDate,
    };
    console.log(pdf);
    return pdf;
  }

  async processPDF(file: Express.Multer.File): Promise<void> {
    const pdfData = await this.readPDF(file);
    const text = pdfData.text;
    const savedDocument = await this.saveDocument(pdfData);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    });
    const chunks = await splitter.splitText(text);

    for (const chunk of chunks) {
      const embedding = await this.genereateEmbedding(chunk);
      const documentChunk = new DocumentChunk();
      documentChunk.content = chunk;
      documentChunk.embedding = embedding;
      documentChunk.document = savedDocument;
      this.chunkRepository.getEntityManager().persist(documentChunk);
    }
    await this.documentRepository.getEntityManager().flush();
  }

  async saveDocument(pdf: PDFData): Promise<Document> {
    const doc = this.documentRepository.create(pdf);
    await this.documentRepository.getEntityManager().persistAndFlush(doc);

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
