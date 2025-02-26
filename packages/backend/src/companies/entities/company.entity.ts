import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Department } from './department.entity';

export enum CompanyPlanType {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

@Entity()
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true, unique: true })
  tenantId: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  websiteUrl: string;

  @Column({
    type: 'varchar',
    enum: CompanyPlanType,
    default: CompanyPlanType.BASIC
  })
  planType: CompanyPlanType;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => User, user => user.company)
  users: User[];

  @OneToMany(() => Department, department => department.company)
  departments: Department[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 