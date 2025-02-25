import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourcePermission } from './entities/resource-permission.entity';
import { CreateResourcePermissionDto } from './dto/resource-permission.dto';
import { UpdateResourcePermissionDto } from './dto/resource-permission.dto';
import { User } from '../auth/entities/user.entity';
import { PermissionAction } from './entities/permission.entity';

@Injectable()
export class ResourcePermissionsService {
  constructor(
    @InjectRepository(ResourcePermission)
    private resourcePermissionsRepository: Repository<ResourcePermission>,
  ) {}

  async create(createResourcePermissionDto: CreateResourcePermissionDto, user: User): Promise<ResourcePermission> {
    // 同じリソースに対する権限設定が既に存在するか確認
    const existingPermission = await this.resourcePermissionsRepository.findOne({
      where: {
        userId: createResourcePermissionDto.userId,
        resourceType: createResourcePermissionDto.resourceType,
        resourceId: createResourcePermissionDto.resourceId,
        action: createResourcePermissionDto.action,
      },
    });

    if (existingPermission) {
      // 既存の権限設定を更新
      existingPermission.isGranted = createResourcePermissionDto.isGranted === undefined ? true : createResourcePermissionDto.isGranted;
      return this.resourcePermissionsRepository.save(existingPermission);
    }

    // 新規作成
    const resourcePermission = this.resourcePermissionsRepository.create({
      ...createResourcePermissionDto,
      isGranted: createResourcePermissionDto.isGranted === undefined ? true : createResourcePermissionDto.isGranted,
    });

    return this.resourcePermissionsRepository.save(resourcePermission);
  }

  async findAll(query: {
    userId?: string;
    resourceType?: string;
    resourceId?: string;
    action?: PermissionAction;
  }): Promise<ResourcePermission[]> {
    return this.resourcePermissionsRepository.find({
      where: { ...query },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async findOne(id: string): Promise<ResourcePermission> {
    const resourcePermission = await this.resourcePermissionsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!resourcePermission) {
      throw new NotFoundException('リソース権限が見つかりません');
    }

    return resourcePermission;
  }

  async findByResourceAndUser(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: PermissionAction,
  ): Promise<ResourcePermission | null> {
    return this.resourcePermissionsRepository.findOne({
      where: {
        userId,
        resourceType,
        resourceId,
        action,
      },
    });
  }

  async update(id: string, updateResourcePermissionDto: UpdateResourcePermissionDto): Promise<ResourcePermission> {
    const resourcePermission = await this.findOne(id);
    
    resourcePermission.isGranted = updateResourcePermissionDto.isGranted;
    
    return this.resourcePermissionsRepository.save(resourcePermission);
  }

  async remove(id: string): Promise<void> {
    const resourcePermission = await this.findOne(id);
    await this.resourcePermissionsRepository.remove(resourcePermission);
  }

  async removeAllByResource(resourceType: string, resourceId: string): Promise<void> {
    await this.resourcePermissionsRepository.delete({
      resourceType,
      resourceId,
    });
  }

  async hasResourcePermission(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: PermissionAction,
  ): Promise<boolean> {
    const resourcePermission = await this.findByResourceAndUser(
      userId,
      resourceType,
      resourceId,
      action,
    );

    return resourcePermission ? resourcePermission.isGranted : false;
  }
} 