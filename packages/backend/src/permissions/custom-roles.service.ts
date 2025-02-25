import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CustomRole } from './entities/custom-role.entity';
import { CustomRolePermission } from './entities/custom-role-permission.entity';
import { UserCustomRole } from './entities/user-custom-role.entity';
import { Permission } from './entities/permission.entity';
import { User } from '../auth/entities/user.entity';
import { CreateCustomRoleDto } from './dto/create-custom-role.dto';
import { UpdateCustomRoleDto } from './dto/update-custom-role.dto';
import { AssignCustomRoleDto, AssignCustomRolesToUserDto, AssignUsersToCustomRoleDto } from './dto/assign-custom-role.dto';

@Injectable()
export class CustomRolesService {
  constructor(
    @InjectRepository(CustomRole)
    private customRolesRepository: Repository<CustomRole>,
    @InjectRepository(CustomRolePermission)
    private customRolePermissionsRepository: Repository<CustomRolePermission>,
    @InjectRepository(UserCustomRole)
    private userCustomRolesRepository: Repository<UserCustomRole>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async create(createCustomRoleDto: CreateCustomRoleDto, user: User): Promise<CustomRole> {
    // ユーザーの企業IDを使用（DTOで指定があればそれを使う）
    const companyId = createCustomRoleDto.companyId || user.companyId;
    
    // ユーザーが別の企業のカスタムロールを作成しようとしていないか確認
    if (companyId !== user.companyId && !user.isSuperAdmin) {
      throw new ForbiddenException('自分の企業のカスタムロールのみ作成できます');
    }

    // カスタムロールを作成
    const customRole = this.customRolesRepository.create({
      name: createCustomRoleDto.name,
      description: createCustomRoleDto.description,
      companyId,
    });

    const savedCustomRole = await this.customRolesRepository.save(customRole);

    // 権限を割り当てる
    if (createCustomRoleDto.permissionIds && createCustomRoleDto.permissionIds.length > 0) {
      await this.assignPermissionsToCustomRole(savedCustomRole.id, createCustomRoleDto.permissionIds);
    }

    return savedCustomRole;
  }

  async findAllByCompany(companyId: string): Promise<CustomRole[]> {
    return this.customRolesRepository.find({
      where: { companyId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, companyId: string): Promise<CustomRole> {
    const customRole = await this.customRolesRepository.findOne({
      where: { id, companyId, isActive: true },
    });

    if (!customRole) {
      throw new NotFoundException('カスタムロールが見つかりません');
    }

    return customRole;
  }

  async update(id: string, updateCustomRoleDto: UpdateCustomRoleDto, user: User): Promise<CustomRole> {
    // カスタムロールが存在し、ユーザーの企業に属しているか確認
    const customRole = await this.findOne(id, user.companyId);

    // 更新
    if (updateCustomRoleDto.name) {
      customRole.name = updateCustomRoleDto.name;
    }
    
    if (updateCustomRoleDto.description !== undefined) {
      customRole.description = updateCustomRoleDto.description;
    }

    const updatedCustomRole = await this.customRolesRepository.save(customRole);

    // 権限を更新
    if (updateCustomRoleDto.permissionIds) {
      // 既存の権限を削除
      await this.customRolePermissionsRepository.delete({ customRoleId: id });
      
      // 新しい権限を割り当て
      if (updateCustomRoleDto.permissionIds.length > 0) {
        await this.assignPermissionsToCustomRole(id, updateCustomRoleDto.permissionIds);
      }
    }

    return updatedCustomRole;
  }

  async remove(id: string, companyId: string): Promise<void> {
    // カスタムロールが存在し、ユーザーの企業に属しているか確認
    const customRole = await this.findOne(id, companyId);

    // 論理削除（isActiveをfalseに設定）
    customRole.isActive = false;
    await this.customRolesRepository.save(customRole);
  }

  async getPermissionsByCustomRoleId(customRoleId: string): Promise<Permission[]> {
    const customRolePermissions = await this.customRolePermissionsRepository.find({
      where: { customRoleId },
      relations: ['permission'],
    });

    return customRolePermissions.map(crp => crp.permission);
  }

  async assignPermissionsToCustomRole(customRoleId: string, permissionIds: string[]): Promise<void> {
    // 権限が存在するか確認
    const permissions = await this.permissionsRepository.find({
      where: { id: In(permissionIds) },
    });

    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('一部の権限が見つかりません');
    }

    const customRolePermissions = permissionIds.map(permissionId => ({
      customRoleId,
      permissionId,
    }));

    await this.customRolePermissionsRepository.save(customRolePermissions);
  }

  async assignCustomRoleToUser(assignDto: AssignCustomRoleDto): Promise<UserCustomRole> {
    // カスタムロールとユーザーが既に関連付けられているか確認
    const existingMapping = await this.userCustomRolesRepository.findOne({
      where: {
        userId: assignDto.userId,
        customRoleId: assignDto.customRoleId,
      },
    });

    if (existingMapping) {
      return existingMapping; // 既に割り当て済み
    }

    // 新規関連付け
    const userCustomRole = this.userCustomRolesRepository.create({
      userId: assignDto.userId,
      customRoleId: assignDto.customRoleId,
    });

    return this.userCustomRolesRepository.save(userCustomRole);
  }

  async removeCustomRoleFromUser(userId: string, customRoleId: string): Promise<void> {
    await this.userCustomRolesRepository.delete({
      userId,
      customRoleId,
    });
  }

  async assignCustomRolesToUser(userId: string, dto: AssignCustomRolesToUserDto): Promise<void> {
    // 既存の割り当てを削除
    await this.userCustomRolesRepository.delete({ userId });

    // 新しい割り当てを作成
    if (dto.customRoleIds.length > 0) {
      const userCustomRoles = dto.customRoleIds.map(customRoleId => ({
        userId,
        customRoleId,
      }));
      
      await this.userCustomRolesRepository.save(userCustomRoles);
    }
  }

  async assignUsersToCustomRole(customRoleId: string, dto: AssignUsersToCustomRoleDto): Promise<void> {
    // 既存の割り当てを削除
    await this.userCustomRolesRepository.delete({ customRoleId });

    // 新しい割り当てを作成
    if (dto.userIds.length > 0) {
      const userCustomRoles = dto.userIds.map(userId => ({
        userId,
        customRoleId,
      }));
      
      await this.userCustomRolesRepository.save(userCustomRoles);
    }
  }

  async getUsersByCustomRoleId(customRoleId: string): Promise<User[]> {
    const userCustomRoles = await this.userCustomRolesRepository.find({
      where: { customRoleId },
      relations: ['user'],
    });

    return userCustomRoles.map(ucr => ucr.user);
  }

  async getCustomRolesByUserId(userId: string): Promise<CustomRole[]> {
    const userCustomRoles = await this.userCustomRolesRepository.find({
      where: { userId },
      relations: ['customRole'],
    });

    return userCustomRoles.map(ucr => ucr.customRole);
  }
} 