import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { JobPosting } from '../../job-postings/entities/job-posting.entity';
import { Interview } from '../../interviews/entities/interview.entity';
import { Evaluation } from '../../evaluations/entities/evaluation.entity';

export type CandidateStatus = 'new' | 'reviewing' | 'interviewed' | 'offered' | 'rejected';

@Entity()
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  role: string;

  @Column({
    type: 'simple-enum',
    enum: ['new', 'reviewing', 'interviewed', 'offered', 'rejected'],
    default: 'new'
  })
  status: CandidateStatus;

  @Column()
  experience: number;

  @Column('simple-array')
  skills: string[];

  @Column({ nullable: true })
  expectedSalary?: number;

  @Column({ nullable: true })
  currentSalary?: number;

  @Column()
  source: string;

  @Column()
  location: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => JobPosting, { eager: true })
  jobPosting: JobPosting;

  @OneToMany(() => Interview, interview => interview.candidate, { eager: true })
  interviews: Interview[];

  @OneToMany(() => Evaluation, evaluation => evaluation.candidate, { eager: true })
  evaluations: Evaluation[];

  @CreateDateColumn()
  appliedDate: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}