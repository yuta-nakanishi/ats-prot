import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';

@ApiTags('evaluations')
@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Get('candidate/:candidateId')
  @ApiOperation({ summary: '候補者の評価一覧を取得' })
  findByCandidateId(@Param('candidateId') candidateId: string) {
    return this.evaluationsService.findByCandidateId(candidateId);
  }

  @Post()
  @ApiOperation({ summary: '評価を新規登録' })
  create(@Body() createEvaluationDto: CreateEvaluationDto) {
    return this.evaluationsService.create(createEvaluationDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '評価情報を更新' })
  update(@Param('id') id: string, @Body() updateEvaluationDto: UpdateEvaluationDto) {
    return this.evaluationsService.update(id, updateEvaluationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '評価を削除' })
  remove(@Param('id') id: string) {
    return this.evaluationsService.remove(id);
  }
}