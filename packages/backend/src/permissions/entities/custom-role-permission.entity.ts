import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CustomRole } from './custom-role.entity';
import { Permission } from './permission.entity';

@Entity()
export class CustomRolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customRoleId: string;

  @ManyToOne(() => CustomRole, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customRoleId' })
  customRole: CustomRole;

  @Column()
  permissionId: string;

  @ManyToOne(() => Permission)
  @JoinColumn({ name: 'permissionId' })
  permission: Permission;

  @CreateDateColumn()
  createdAt: Date;
} 