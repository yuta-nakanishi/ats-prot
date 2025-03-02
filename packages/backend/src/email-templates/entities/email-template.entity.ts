import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type EmailTemplateType = 'interview_invitation' | 'offer' | 'rejection' | 'general';

@Entity('email_templates')
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  subject: string;

  @Column('text')
  body: string;

  @Column({
    type: 'varchar',
    enum: ['interview_invitation', 'offer', 'rejection', 'general'],
    default: 'general'
  })
  type: EmailTemplateType;

  @Column('simple-array')
  variables: string[];

  @Column({ type: 'uuid', nullable: true })
  companyId: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 