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

  @Column({ name: 'summary_title', type: 'varchar', length: 200, nullable: true })
  summaryTitle: string | null;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ name: 'summary_model', type: 'varchar', length: 80, nullable: true })
  summaryModel: string | null;

  @Column({ name: 'summarized_at', type: 'timestamptz', nullable: true })
  summarizedAt: Date | null;

  @Column({ name: 'summary_attempts', type: 'smallint', default: 0 })
  summaryAttempts: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
