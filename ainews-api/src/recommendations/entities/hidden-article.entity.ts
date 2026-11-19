import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'hidden_articles' })
export class HiddenArticle {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @PrimaryColumn({ name: 'article_id', type: 'uuid' })
  articleId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
