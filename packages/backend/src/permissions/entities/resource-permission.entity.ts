import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { PermissionAction } from './permission.entity';

@Entity()
export class ResourcePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  resourceType: string; // 'job_posting', 'candidate', 'interview', etc.

  @Column()
  resourceId: string;

  @Column({
    type: 'varchar',
    enum: PermissionAction,
  })
  action: PermissionAction;

  @Column({ default: true })
  isGranted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 