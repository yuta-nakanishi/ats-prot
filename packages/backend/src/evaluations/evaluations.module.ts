import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationsService } from './evaluations.service';
import { Evaluation } from './entities/evaluation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Evaluation])],
  controllers: [EvaluationsController],
  providers: [EvaluationsService],
})
export class EvaluationsModule {}