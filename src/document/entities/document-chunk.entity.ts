import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { VectorType } from 'pgvector/mikro-orm';
import { v4 } from 'uuid';
import { Vector, Document } from './document.entity';

@Entity()
export class DocumentChunk {
  @PrimaryKey({ type: 'uuid' })
  uuid = v4();

  @Property({ type: 'text' })
  content: string;

  @Property({ type: VectorType })
  embedding: Vector;

  @ManyToOne(() => Document)
  document: Document;
  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();
}
