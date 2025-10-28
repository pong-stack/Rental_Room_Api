import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Room } from './room.entity';
import { VerificationRequest } from './verification-request.entity';
import { Invoice } from './invoice.entity';

export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('homes')
export class Home {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'owner_id' })
  ownerId: number;

  @Column({ length: 150, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  address: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'image_1', type: 'varchar', length: 500, nullable: true })
  image1: string;

  @Column({ name: 'image_2', type: 'varchar', length: 500, nullable: true })
  image2: string;

  @Column({ name: 'image_3', type: 'varchar', length: 500, nullable: true })
  image3: string;

  @Column({ name: 'image_4', type: 'varchar', length: 500, nullable: true })
  image4: string;

  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verificationStatus: VerificationStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.homes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => Room, room => room.home)
  rooms: Room[];

  @OneToMany(() => VerificationRequest, request => request.home)
  verificationRequests: VerificationRequest[];

  @OneToMany(() => Invoice, invoice => invoice.home)
  invoices: Invoice[];
}
