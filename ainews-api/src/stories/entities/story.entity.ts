import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'stories' })
export class Story {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'primary_article_id', type: 'uuid', nullable: true })
  primaryArticleId: string | null;

  @Column({ name: 'article_count', type: 'integer', default: 1 })
  articleCount: number;

  @Column({ name: 'source_count', type: 'integer', default: 1 })
  sourceCount: number;

  @Column({ name: 'first_published_at', type: 'timestamptz' })
  firstPublishedAt: Date;

  @Column({ name: 'last_published_at', type: 'timestamptz' })
  lastPublishedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
