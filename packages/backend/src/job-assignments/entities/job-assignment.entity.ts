import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { JobPosting } from '../../job-postings/entities/job-posting.entity';

export enum AssignmentRole {
  PRIMARY = 'primary',    // 主担当
  SECONDARY = 'secondary', // 副担当
  VIEWER = 'viewer',      // 閲覧のみ
}

@Entity()
export class JobAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  jobPostingId: string;

  @ManyToOne(() => JobPosting, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobPostingId' })
  jobPosting: JobPosting;

  @Column({
    type: 'varchar',
    enum: AssignmentRole,
    default: AssignmentRole.SECONDARY
  })
  role: AssignmentRole;

  @Column({ default: true })
  notificationsEnabled: boolean;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 