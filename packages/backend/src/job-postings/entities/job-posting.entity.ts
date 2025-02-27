import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Candidate } from '../../candidates/entities/candidate.entity';
import { JobAssignment } from '../../job-assignments/entities/job-assignment.entity';
import { Company } from '../../companies/entities/company.entity';

export type JobPostingStatus = 'open' | 'closed' | 'draft';
export type EmploymentType = 'full-time' | 'part-time' | 'contract';

@Entity()
export class JobPosting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  department: string;

  @Column()
  location: string;

  @Column({
    type: 'simple-enum',
    enum: ['full-time', 'part-time', 'contract']
  })
  employmentType: EmploymentType;

  @Column({
    type: 'simple-enum',
    enum: ['open', 'closed', 'draft'],
    default: 'draft'
  })
  status: JobPostingStatus;

  @Column('text')
  description: string;

  @Column('simple-array')
  requirements: string[];

  @Column('simple-array')
  preferredSkills: string[];

  @Column('int')
  salaryRangeMin: number;

  @Column('int')
  salaryRangeMax: number;

  @Column()
  companyId: string;

  @ManyToOne(() => Company, company => company.id)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @CreateDateColumn()
  postedDate: Date;

  @Column({ type: 'date', nullable: true })
  closingDate?: Date;

  @OneToMany(() => Candidate, candidate => candidate.jobPosting)
  candidates: Candidate[];

  @OneToMany(() => JobAssignment, assignment => assignment.jobPosting)
  assignments: JobAssignment[];
}