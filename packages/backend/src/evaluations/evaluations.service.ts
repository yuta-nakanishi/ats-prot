import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluation } from './entities/evaluation.entity';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectRepository(Evaluation)
    private evaluationsRepository: Repository<Evaluation>,
  ) {}

  async findByCandidateId(candidateId: string): Promise<Evaluation[]> {
    return this.evaluationsRepository.find({
      where: { candidate: { id: candidateId } },
      relations: ['candidate'],
    });
  }

  async create(createEvaluationDto: CreateEvaluationDto): Promise<Evaluation> {
    const evaluation = this.evaluationsRepository.create(createEvaluationDto);
    return this.evaluationsRepository.save(evaluation);
  }

  async update(id: string, updateEvaluationDto: UpdateEvaluationDto): Promise<Evaluation> {
    const evaluation = await this.evaluationsRepository.findOne({ where: { id } });
    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${id} not found`);
    }
    const updated = Object.assign(evaluation, updateEvaluationDto);
    return this.evaluationsRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.evaluationsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Evaluation with ID ${id} not found`);
    }
  }
}