import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { hash } from 'bcrypt';
import { Home } from './home.entity';
import { VerificationRequest } from './verification-request.entity';
import { Invoice } from './invoice.entity';
import { RoleUpgradeRequest } from './role-upgrade-request.entity';

export enum UserRole {
  ADMIN = 'admin',
  HOME_OWNER = 'home_owner',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name', length: 100, nullable: false, default: '' })
  fullName: string;

  @Column({ unique: true, nullable: false, length: 100 })
  email: string;

  @Column({ name: 'password_hash', nullable: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
    nullable: false,
  })
  role: UserRole;

  @Column({ name: 'phone_number', length: 20, nullable: true })
  phoneNumber: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships

  @OneToMany(() => Home, home => home.owner)
  homes: Home[];

  @OneToMany(() => VerificationRequest, request => request.requestedBy)
  verificationRequests: VerificationRequest[];

  @OneToMany(() => VerificationRequest, request => request.reviewedBy)
  reviewedRequests: VerificationRequest[];

  @OneToMany(() => Invoice, invoice => invoice.user)
  invoices: Invoice[];

  @OneToMany(() => RoleUpgradeRequest, request => request.user)
  roleUpgradeRequests: RoleUpgradeRequest[];

  @OneToMany(() => RoleUpgradeRequest, request => request.reviewer)
  reviewedRoleUpgrades: RoleUpgradeRequest[];

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    this.password = (await hash(this.password, 10)) as string;
  }
}
