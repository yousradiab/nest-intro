import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Vector } from 'src/document/entities/document.entity';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;
  constructor() {
    this.openai = new OpenAI();
  }
  async getEmbedding(): Promise<Vector> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input:
        'Blue whales are the largest animals ever known to have lived on Earth. They can reach lengths of up to 100 feet and weigh as much as 200 tons. They are known for their immense size and distinctive blue-gray coloration.',
      encoding_format: 'float',
    });
    console.log(response);
    return response.data[0].embedding;
  }
}
