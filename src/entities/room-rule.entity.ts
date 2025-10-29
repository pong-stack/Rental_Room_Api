import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Room } from './room.entity';
import { Rule } from './rule.entity';

@Entity('room_rules')
export class RoomRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'room_id' })
  roomId: number;

  @Column({ name: 'rule_id' })
  ruleId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => Room, room => room.rules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @ManyToOne(() => Rule, rule => rule.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rule_id' })
  rule: Rule;
}
