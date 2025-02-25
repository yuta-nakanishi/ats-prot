import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

export enum PermissionResource {
  COMPANY = 'company',
  USER = 'user',
  DEPARTMENT = 'department',
  TEAM = 'team',
  JOB_POSTING = 'job_posting',
  CANDIDATE = 'candidate',
  INTERVIEW = 'interview',
  EVALUATION = 'evaluation',
  REPORT = 'report',
}

@Entity()
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'varchar',
    enum: PermissionAction,
  })
  action: PermissionAction;

  @Column({
    type: 'varchar',
    enum: PermissionResource,
  })
  resource: PermissionResource;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 