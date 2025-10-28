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
import { Home } from './home.entity';
import { RoomRule } from './room-rule.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'home_id' })
  homeId: number;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ type: 'int', nullable: true })
  capacity: number;

  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ name: 'image_1', type: 'varchar', length: 500, nullable: true })
  image1: string;

  @Column({ name: 'image_2', type: 'varchar', length: 500, nullable: true })
  image2: string;

  @Column({ name: 'image_3', type: 'varchar', length: 500, nullable: true })
  image3: string;

  @Column({ name: 'image_4', type: 'varchar', length: 500, nullable: true })
  image4: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Home, home => home.rooms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'home_id' })
  home: Home;

  @OneToMany(() => RoomRule, rule => rule.room)
  rules: RoomRule[];
}
