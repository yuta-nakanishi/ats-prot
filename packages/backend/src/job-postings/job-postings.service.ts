import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPosting } from './entities/job-posting.entity';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';

@Injectable()
export class JobPostingsService {
  constructor(
    @InjectRepository(JobPosting)
    private jobPostingsRepository: Repository<JobPosting>,
  ) {}

  async findAll(status?: string, companyId?: string): Promise<JobPosting[]> {
    const queryBuilder = this.jobPostingsRepository.createQueryBuilder('jobPosting');
    
    if (status) {
      queryBuilder.andWhere('jobPosting.status = :status', { status });
    }
    
    if (companyId) {
      queryBuilder.andWhere('jobPosting.companyId = :companyId', { companyId });
    }
    
    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<JobPosting> {
    const jobPosting = await this.jobPostingsRepository.findOne({ where: { id } });
    if (!jobPosting) {
      throw new NotFoundException(`Job posting with ID ${id} not found`);
    }
    return jobPosting;
  }

  async create(createJobPostingDto: CreateJobPostingDto): Promise<JobPosting> {
    const jobPosting = this.jobPostingsRepository.create(createJobPostingDto);
    return this.jobPostingsRepository.save(jobPosting);
  }

  async update(id: string, updateJobPostingDto: UpdateJobPostingDto): Promise<JobPosting> {
    const jobPosting = await this.findOne(id);
    const updated = Object.assign(jobPosting, updateJobPostingDto);
    return this.jobPostingsRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.jobPostingsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Job posting with ID ${id} not found`);
    }
  }
}