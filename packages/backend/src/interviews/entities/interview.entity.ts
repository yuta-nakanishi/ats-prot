import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Candidate } from '../../candidates/entities/candidate.entity';

export type InterviewType = 'initial' | 'technical' | 'cultural' | 'final';
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled';
export type InterviewLocation = 'online' | 'office';

@Entity()
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'simple-enum',
    enum: ['initial', 'technical', 'cultural', 'final']
  })
  type: InterviewType;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  time: string;

  @Column()
  interviewer: string;

  @Column({
    type: 'simple-enum',
    enum: ['online', 'office']
  })
  location: InterviewLocation;

  @Column({
    type: 'simple-enum',
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  })
  status: InterviewStatus;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Candidate, candidate => candidate.interviews)
  candidate: Candidate;
}