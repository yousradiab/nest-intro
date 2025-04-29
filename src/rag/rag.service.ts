import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Vector } from 'src/document/entities/document.entity';
import { CohereClient } from 'cohere-ai';
import { DocumentChunk } from 'src/document/entities/document-chunk.entity';

type cohereRerankResponse = {
  index: number;
  relevanceScore: number;
  text: string;
};

@Injectable()
export class RagService {
  private openai: OpenAI;
  private cohereClient: CohereClient;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.cohereClient = new CohereClient({
      token: process.env.COHERE_API_KEY,
    });
  }

  async generateAnswer(prompt: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Du er en hjælpsom assistent.' },
        { role: 'user', content: prompt },
      ],
    });

    return response.choices[0].message.content ?? 'Intet svar fra OpenAI.';
  }

  async generateEmbedding(text: string): Promise<Vector> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });
    console.log(response);
    return response.data[0].embedding;
  }
  async rerankWithCohere(
    query: string,
    documentChunks: DocumentChunk[],
    topN = 5,
  ): Promise<cohereRerankResponse[]> {
    const docsForCohere = documentChunks.map((chunk) => chunk.content);

    const rerankedResults = await this.cohereClient.rerank({
      query,
      documents: docsForCohere,
      topN: topN,
      model: 'rerank-v3.5',
    });

    const sortedChunks: cohereRerankResponse[] = rerankedResults.results.map(
      (result) => ({
        text: documentChunks[result.index].content,
        relevanceScore: result.relevanceScore,
        index: result.index,
      }),
    );

    return sortedChunks;
  }

  // async rerankWithCohere(
  //   query: string,
  //   documentChunks: DocumentChunk[],
  //   topN = 5,
  // ) {
  //   const docsForCohere: string[] = [];
  //   for (const chunk of documentChunks) {
  //     docsForCohere.push(chunk.content);
  //   }
  //   const rerankedResults = await this.cohereClient.rerank({
  //     query,
  //     documents: docsForCohere,
  //     topN: topN,
  //     model: 'rerank-v3.5',
  //   });
  //   return rerankedResults;
  // }
}
