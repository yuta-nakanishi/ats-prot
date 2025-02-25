import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from './entities/candidate.entity';
import { CandidateStatus } from './entities/candidate.entity';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private candidatesRepository: Repository<Candidate>,
  ) {}

  async findAll(status?: string): Promise<Candidate[]> {
    if (status) {
      return this.candidatesRepository.find({
        where: { status: status as CandidateStatus },
        relations: ['jobPosting']
      });
    }
    return this.candidatesRepository.find({
      relations: ['jobPosting']
    });
  }

  async findOne(id: string): Promise<Candidate> {
    const candidate = await this.candidatesRepository.findOne({
      where: { id },
      relations: ['jobPosting']
    });
    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }
    return candidate;
  }

  async create(createCandidateDto: CreateCandidateDto): Promise<Candidate> {
    const candidate = this.candidatesRepository.create(createCandidateDto);
    return this.candidatesRepository.save(candidate);
  }

  async update(id: string, updateCandidateDto: UpdateCandidateDto): Promise<Candidate> {
    const candidate = await this.findOne(id);
    const updated = Object.assign(candidate, updateCandidateDto);
    return this.candidatesRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.candidatesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }
  }
}