import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, type Relation } from 'typeorm';
import { Article } from '../../articles/entities/article.entity.js';

@Entity({ name: 'reading_history' })
export class ReadingHistory {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @PrimaryColumn({ name: 'article_id', type: 'uuid' })
  articleId: string;

  @ManyToOne(() => Article, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'article_id' })
  article: Relation<Article>;

  @Column({ name: 'read_at', type: 'timestamptz', default: () => 'now()' })
  readAt: Date;

  @Column({ name: 'from_exploration', type: 'boolean', default: false })
  fromExploration: boolean;
}
