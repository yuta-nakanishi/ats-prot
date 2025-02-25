import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { CustomRole } from './custom-role.entity';

@Entity()
export class UserCustomRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  customRoleId: string;

  @ManyToOne(() => CustomRole, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customRoleId' })
  customRole: CustomRole;

  @CreateDateColumn()
  createdAt: Date;
} 