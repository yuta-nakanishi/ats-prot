import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Department } from '../../companies/entities/department.entity';
import { Team } from '../../companies/entities/team.entity';
import { JobAssignment } from '../../job-assignments/entities/job-assignment.entity';

export enum UserRole {
  COMPANY_ADMIN = 'company_admin',
  HIRING_MANAGER = 'hiring_manager',
  RECRUITER = 'recruiter',
  INTERVIEWER = 'interviewer',
  READONLY = 'readonly',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({
    type: 'varchar',
    enum: UserRole,
    default: UserRole.RECRUITER
  })
  role: UserRole;

  @Column({ nullable: true })
  companyId: string;

  @ManyToOne(() => Company, company => company.users)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ nullable: true })
  departmentId: string;

  @ManyToOne(() => Department, department => department.users)
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ nullable: true })
  teamId: string;

  @ManyToOne(() => Team, team => team.users)
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @Column({ nullable: true })
  jobTitle: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ default: false })
  isSuperAdmin: boolean;

  @Column({ default: false })
  isCompanyAdmin: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => JobAssignment, assignment => assignment.user)
  jobAssignments: JobAssignment[];
}