import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'user_interests' })
export class UserInterest {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @PrimaryColumn({ name: 'category_id', type: 'smallint' })
  categoryId: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
