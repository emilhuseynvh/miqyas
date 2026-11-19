import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity.js';
import { Source } from '../../sources/entities/source.entity.js';
import { Story } from '../../stories/entities/story.entity.js';

@Entity({ name: 'articles' })
@Index('idx_articles_published_at', ['publishedAt'])
@Index('idx_articles_source_id', ['sourceId'])
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'source_id', type: 'uuid' })
  sourceId: string;

  @ManyToOne(() => Source, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'source_id' })
  source: Relation<Source>;

  @Column({ name: 'category_id', type: 'smallint', nullable: true })
  categoryId: number | null;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'text', unique: true })
  url: string;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ type: 'text', nullable: true, select: false })
  content: string | null;

  @Column({ name: 'content_extracted_at', type: 'timestamptz', nullable: true })
  contentExtractedAt: Date | null;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  author: string | null;

  @Column({ name: 'feed_categories', type: 'text', array: true, default: () => "'{}'" })
  feedCategories: string[];

  @Column({ name: 'published_at', type: 'timestamptz', default: () => 'now()' })
  publishedAt: Date;

  @Column({ name: 'story_id', type: 'uuid', nullable: true })
  storyId: string | null;

  @ManyToOne(() => Story, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'story_id' })
  story: Relation<Story> | null;

  @Column({ name: 'title_key', type: 'text', nullable: true, select: false })
  titleKey: string | null;

  @Column({ name: 'clustered_at', type: 'timestamptz', nullable: true, select: false })
  clusteredAt: Date | null;

  @Column({ name: 'view_count', type: 'integer', default: 0 })
  viewCount: number;

  @Column({ name: 'like_count', type: 'integer', default: 0 })
  likeCount: number;

  @Column({ name: 'dislike_count', type: 'integer', default: 0 })
  dislikeCount: number;

  @CreateDateColumn({ name: 'fetched_at', type: 'timestamptz' })
  fetchedAt: Date;
}
