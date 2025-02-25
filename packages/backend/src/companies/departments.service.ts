import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto, user: User): Promise<Department> {
    // ユーザーの企業IDを使用（DTOで指定があればそれを使う）
    const companyId = createDepartmentDto.companyId || user.companyId;
    
    // ユーザーが別の企業の部署を作成しようとしていないか確認
    if (companyId !== user.companyId && !user.isSuperAdmin) {
      throw new ForbiddenException('自分の企業の部署のみ作成できます');
    }

    const department = this.departmentsRepository.create({
      ...createDepartmentDto,
      companyId,
    });

    return this.departmentsRepository.save(department);
  }

  async findAllByCompany(companyId: string): Promise<Department[]> {
    return this.departmentsRepository.find({
      where: { companyId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, companyId: string): Promise<Department> {
    const department = await this.departmentsRepository.findOne({
      where: { id, companyId, isActive: true },
      relations: ['teams'],
    });

    if (!department) {
      throw new NotFoundException('部署が見つかりません');
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto, companyId: string): Promise<Department> {
    // 部署が存在し、ユーザーの企業に属しているか確認
    const department = await this.findOne(id, companyId);

    // 更新
    this.departmentsRepository.merge(department, updateDepartmentDto);
    return this.departmentsRepository.save(department);
  }

  async remove(id: string, companyId: string): Promise<void> {
    // 部署が存在し、ユーザーの企業に属しているか確認
    const department = await this.findOne(id, companyId);

    // 論理削除（isActiveをfalseに設定）
    department.isActive = false;
    await this.departmentsRepository.save(department);
  }
} 