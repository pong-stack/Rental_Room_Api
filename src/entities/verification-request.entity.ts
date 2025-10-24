import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Home } from './home.entity';
import { User } from './user.entity';

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('verification_requests')
export class VerificationRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'home_id' })
  homeId: number;

  @Column({ name: 'requested_by' })
  requestedBy: number;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Column({ name: 'admin_comment', type: 'text', nullable: true })
  adminComment: string;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: number;

  @CreateDateColumn({ name: 'requested_at' })
  requestedAt: Date;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  // Relationships
  @ManyToOne(() => Home, home => home.verificationRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'home_id' })
  home: Home;

  @ManyToOne(() => User, user => user.verificationRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requested_by' })
  requester: User;

  @ManyToOne(() => User, user => user.reviewedRequests, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;
}
