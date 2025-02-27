import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { JobPosting } from '../../job-postings/entities/job-posting.entity';
import { Interview } from '../../interviews/entities/interview.entity';
import { Evaluation } from '../../evaluations/entities/evaluation.entity';

export type CandidateStatus = 'new' | 'screening' | 'interview' | 'technical' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
export type CandidateSource = 'company_website' | 'indeed' | 'linkedin' | 'referral' | 'agency' | 'job_fair' | 'other';

@Entity()
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  position: string;

  @Column({
    type: 'simple-enum',
    enum: ['new', 'screening', 'interview', 'technical', 'offer', 'hired', 'rejected', 'withdrawn'],
    default: 'new'
  })
  status: CandidateStatus;

  @Column({ nullable: true })
  experience: number;

  @Column('simple-array', { nullable: true })
  skills: string[];

  @Column({ nullable: true })
  expectedSalary?: string;

  @Column({ nullable: true })
  currentCompany?: string;

  @Column({
    type: 'simple-enum',
    enum: ['company_website', 'indeed', 'linkedin', 'referral', 'agency', 'job_fair', 'other'],
    default: 'other'
  })
  source: CandidateSource;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ nullable: true })
  birthDate?: string;

  @Column({ nullable: true })
  availableFrom?: string;

  @Column({ nullable: true })
  education?: string;

  @Column({ type: 'simple-json', nullable: true })
  urls?: {
    website?: string;
    linkedin?: string;
    github?: string;
  };

  @Column({ nullable: true })
  resumeFileName?: string;

  @Column({ nullable: true })
  resumeFilePath?: string;

  @Column({ nullable: true })
  rating?: number;

  @ManyToOne(() => JobPosting, { eager: true, nullable: true })
  jobPosting: JobPosting;

  @Column({ nullable: true })
  jobId: string;

  @OneToMany(() => Interview, interview => interview.candidate, { eager: true })
  interviews: Interview[];

  @OneToMany(() => Evaluation, evaluation => evaluation.candidate, { eager: true })
  evaluations: Evaluation[];

  @CreateDateColumn()
  appliedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}