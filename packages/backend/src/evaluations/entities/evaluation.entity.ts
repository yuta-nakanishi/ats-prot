import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Candidate } from '../../candidates/entities/candidate.entity';

@Entity()
export class Evaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  evaluator: string;

  @CreateDateColumn()
  date: Date;

  @Column('int')
  technicalSkills: number;

  @Column('int')
  communication: number;

  @Column('int')
  problemSolving: number;

  @Column('int')
  teamwork: number;

  @Column('int')
  culture: number;

  @Column('text')
  comments: string;

  @ManyToOne(() => Candidate, candidate => candidate.evaluations)
  candidate: Candidate;
}