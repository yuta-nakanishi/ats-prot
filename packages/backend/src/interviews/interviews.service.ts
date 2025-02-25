import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview } from './entities/interview.entity';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(Interview)
    private interviewsRepository: Repository<Interview>,
  ) {}

  async findByCandidateId(candidateId: string): Promise<Interview[]> {
    return this.interviewsRepository.find({
      where: { candidate: { id: candidateId } },
      relations: ['candidate'],
    });
  }

  async create(createInterviewDto: CreateInterviewDto): Promise<Interview> {
    const interview = this.interviewsRepository.create(createInterviewDto);
    return this.interviewsRepository.save(interview);
  }

  async update(id: string, updateInterviewDto: UpdateInterviewDto): Promise<Interview> {
    const interview = await this.interviewsRepository.findOne({ where: { id } });
    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }
    const updated = Object.assign(interview, updateInterviewDto);
    return this.interviewsRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.interviewsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }
  }
}