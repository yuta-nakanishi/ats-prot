import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { Department } from './entities/department.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
  ) {}

  async create(createTeamDto: CreateTeamDto, user: User): Promise<Team> {
    // 部署が存在し、ユーザーの企業に属しているか確認
    const department = await this.departmentsRepository.findOne({
      where: { id: createTeamDto.departmentId, isActive: true }
    });

    if (!department) {
      throw new NotFoundException('指定された部署が見つかりません');
    }

    // ユーザーが別の企業のチームを作成しようとしていないか確認
    if (department.companyId !== user.companyId && !user.isSuperAdmin) {
      throw new ForbiddenException('自分の企業の部署にのみチームを作成できます');
    }

    const team = this.teamsRepository.create(createTeamDto);
    return this.teamsRepository.save(team);
  }

  async findAllByCompany(companyId: string, departmentId?: string): Promise<Team[]> {
    const query = this.teamsRepository.createQueryBuilder('team')
      .innerJoin('team.department', 'department')
      .where('department.companyId = :companyId', { companyId })
      .andWhere('team.isActive = :isActive', { isActive: true });

    if (departmentId) {
      query.andWhere('team.departmentId = :departmentId', { departmentId });
    }

    return query.orderBy('team.name', 'ASC').getMany();
  }

  async findOne(id: string, companyId: string): Promise<Team> {
    const team = await this.teamsRepository.createQueryBuilder('team')
      .innerJoin('team.department', 'department')
      .where('team.id = :id', { id })
      .andWhere('department.companyId = :companyId', { companyId })
      .andWhere('team.isActive = :isActive', { isActive: true })
      .leftJoinAndSelect('team.users', 'users')
      .getOne();

    if (!team) {
      throw new NotFoundException('チームが見つかりません');
    }

    return team;
  }

  async update(id: string, updateTeamDto: UpdateTeamDto, companyId: string): Promise<Team> {
    // チームが存在し、ユーザーの企業に属しているか確認
    const team = await this.findOne(id, companyId);

    // 部署IDが変更される場合、新しい部署が同じ企業に属しているか確認
    if (updateTeamDto.departmentId && updateTeamDto.departmentId !== team.departmentId) {
      const newDepartment = await this.departmentsRepository.findOne({
        where: { id: updateTeamDto.departmentId, companyId, isActive: true }
      });
      
      if (!newDepartment) {
        throw new NotFoundException('指定された部署が見つからないか、アクセスできません');
      }
    }

    // 更新
    this.teamsRepository.merge(team, updateTeamDto);
    return this.teamsRepository.save(team);
  }

  async remove(id: string, companyId: string): Promise<void> {
    // チームが存在し、ユーザーの企業に属しているか確認
    const team = await this.findOne(id, companyId);

    // 論理削除（isActiveをfalseに設定）
    team.isActive = false;
    await this.teamsRepository.save(team);
  }
} 