import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SubscriberStatus {
  Pending = 'pending',
  Active = 'active',
  Unsubscribed = 'unsubscribed',
}

@Entity({ name: 'subscribers' })
export class Subscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 320, unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: SubscriberStatus,
    enumName: 'subscriber_status',
    default: SubscriberStatus.Pending,
  })
  status: SubscriberStatus;

  @Column({ name: 'confirm_token', type: 'uuid', nullable: true, unique: true })
  confirmToken: string | null;

  @Column({
    name: 'unsubscribe_token',
    type: 'uuid',
    unique: true,
    default: () => 'gen_random_uuid()',
  })
  unsubscribeToken: string;

  @Column({ name: 'confirmed_at', type: 'timestamptz', nullable: true })
  confirmedAt: Date | null;

  @Column({ name: 'unsubscribed_at', type: 'timestamptz', nullable: true })
  unsubscribedAt: Date | null;

  @Column({ name: 'last_sent_at', type: 'timestamptz', nullable: true })
  lastSentAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
