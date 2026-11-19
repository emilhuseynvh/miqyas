import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Article } from '../../articles/entities/article.entity.js';
import { Category } from '../../categories/entities/category.entity.js';
import { SourceStatus } from '../enums/source-status.enum.js';

@Entity({ name: 'sources' })
export class Source {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  slug: string;

  @Column({ name: 'site_url', type: 'varchar', length: 500, unique: true })
  siteUrl: string;

  @Column({ name: 'feed_url', type: 'varchar', length: 1000, nullable: true })
  feedUrl: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  kind: string | null;

  @Column({ type: 'varchar', length: 8, default: 'az' })
  language: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: SourceStatus,
    enumName: 'source_status',
    default: SourceStatus.Pending,
  })
  status: SourceStatus;

  @Column({ name: 'default_category_id', type: 'smallint', nullable: true })
  defaultCategoryId: number | null;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'default_category_id' })
  defaultCategory: Category | null;

  @Column({ name: 'last_fetched_at', type: 'timestamptz', nullable: true })
  lastFetchedAt: Date | null;

  @Column({ name: 'last_success_at', type: 'timestamptz', nullable: true })
  lastSuccessAt: Date | null;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError: string | null;

  @Column({ name: 'consecutive_failures', type: 'integer', default: 0 })
  consecutiveFailures: number;

  @Column({ name: 'last_item_count', type: 'integer', default: 0 })
  lastItemCount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Article, (article) => article.source)
  articles: Relation<Article[]>;

  articleCount?: number;
}
