/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { Document, Vector } from './entities/document.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { CohereRerankResponse, RagService } from 'src/rag/rag.service';
import * as pdfParse from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { DocumentChunk } from './entities/document-chunk.entity';
import { cosineDistance } from 'pgvector/mikro-orm';

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
    private readonly ragService: RagService,
    private readonly em: EntityManager,
  ) {}

  async findAll() {
    return this.documentRepository.findAll();
  }

  async genereateEmbedding(text: string): Promise<Vector> {
    const response = await this.ragService.generateEmbedding(text);
    return response;
  }

  async generateRespons(
    prompt: string,
    relevantChunks: CohereRerankResponse[],
  ): Promise<string> {
    return await this.ragService.generateResponse(prompt, relevantChunks);
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
    const cleanedText = pdfData.text
      .replace(/\t/g, ' ') // erstatter tab med mellemrum
      .replace(/[ ]{2,}/g, ' ') // fjerner dobbelte mellemrum
      .replace(/[ ]*\n[ ]*/g, '\n') // fjerner mellemrum omkring linjeskift
      .trim();

    const savedDocument = await this.saveDocument(pdfData);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    });

    const chunks = await splitter.splitText(cleanedText);

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

  async findSimilar(
    qureyEmbedding: number[],
    limit = 5,
  ): Promise<DocumentChunk[]> {
    const documentChunk = await this.em
      .createQueryBuilder(DocumentChunk)
      .orderBy({
        [cosineDistance('embedding', qureyEmbedding, this.em)]: 'ASC',
      })
      .limit(limit)
      .getResult();
    return documentChunk;
  }

  async retrieveSimilarDocumentChunks(
    query: string,
    limit = 20,
  ): Promise<DocumentChunk[]> {
    const queryEmbedding = await this.genereateEmbedding(query);
    return this.findSimilar(queryEmbedding, limit);
  }

  async rerankWithCohere(
    query: string,
    documentChunks: DocumentChunk[],
    topN = 5,
  ) {
    return await this.ragService.rerankWithCohere(query, documentChunks, topN);
  }
}
