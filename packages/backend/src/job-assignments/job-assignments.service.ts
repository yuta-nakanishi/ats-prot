import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobAssignment } from './entities/job-assignment.entity';
import { User } from '../auth/entities/user.entity';
import { JobPosting } from '../job-postings/entities/job-posting.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class JobAssignmentsService {
  constructor(
    @InjectRepository(JobAssignment)
    private jobAssignmentRepository: Repository<JobAssignment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(JobPosting)
    private jobPostingRepository: Repository<JobPosting>,
  ) {}

  /**
   * 求人に対する担当者の割り当てを作成する
   */
  async create(createAssignmentDto: CreateAssignmentDto): Promise<JobAssignment> {
    const { userId, jobPostingId } = createAssignmentDto;
    
    // ユーザーの存在確認
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`ユーザーID ${userId} が見つかりません`);
    }
    
    // 求人の存在確認
    const jobPosting = await this.jobPostingRepository.findOne({ where: { id: jobPostingId } });
    if (!jobPosting) {
      throw new NotFoundException(`求人ID ${jobPostingId} が見つかりません`);
    }
    
    // 既に割り当てが存在するか確認
    const existingAssignment = await this.jobAssignmentRepository.findOne({
      where: { userId, jobPostingId }
    });
    
    if (existingAssignment) {
      throw new ConflictException(`ユーザーID ${userId} は既に求人ID ${jobPostingId} に割り当てられています`);
    }
    
    // 新しい割り当てを作成
    const assignment = this.jobAssignmentRepository.create({
      ...createAssignmentDto,
      user,
      jobPosting
    });
    
    return this.jobAssignmentRepository.save(assignment);
  }

  /**
   * 求人IDに基づいて担当者の割り当てを取得する
   */
  async findByJobPosting(jobPostingId: string): Promise<JobAssignment[]> {
    // 求人の存在確認
    const jobPosting = await this.jobPostingRepository.findOne({ where: { id: jobPostingId } });
    if (!jobPosting) {
      throw new NotFoundException(`求人ID ${jobPostingId} が見つかりません`);
    }
    
    return this.jobAssignmentRepository.find({
      where: { jobPostingId },
      relations: ['user']
    });
  }

  /**
   * ユーザーIDに基づいて担当者の割り当てを取得する
   */
  async findByUser(userId: string): Promise<JobAssignment[]> {
    // ユーザーの存在確認
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`ユーザーID ${userId} が見つかりません`);
    }
    
    return this.jobAssignmentRepository.find({
      where: { userId },
      relations: ['jobPosting']
    });
  }

  /**
   * 特定の割り当てを取得する
   */
  async findOne(id: string): Promise<JobAssignment> {
    const assignment = await this.jobAssignmentRepository.findOne({
      where: { id },
      relations: ['user', 'jobPosting']
    });
    
    if (!assignment) {
      throw new NotFoundException(`割り当てID ${id} が見つかりません`);
    }
    
    return assignment;
  }

  /**
   * 特定の求人とユーザーの割り当てを取得する
   */
  async findOneByUserAndJobPosting(userId: string, jobPostingId: string): Promise<JobAssignment> {
    const assignment = await this.jobAssignmentRepository.findOne({
      where: { userId, jobPostingId },
      relations: ['user', 'jobPosting']
    });
    
    if (!assignment) {
      throw new NotFoundException(`ユーザーID ${userId} と求人ID ${jobPostingId} の割り当てが見つかりません`);
    }
    
    return assignment;
  }

  /**
   * 割り当てを更新する
   */
  async update(id: string, updateAssignmentDto: UpdateAssignmentDto): Promise<JobAssignment> {
    const assignment = await this.findOne(id);
    
    // 更新データを適用
    Object.assign(assignment, updateAssignmentDto);
    
    return this.jobAssignmentRepository.save(assignment);
  }

  /**
   * 割り当てを削除する
   */
  async remove(id: string): Promise<void> {
    const assignment = await this.findOne(id);
    await this.jobAssignmentRepository.remove(assignment);
  }
} 