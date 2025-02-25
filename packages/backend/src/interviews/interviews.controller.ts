import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';

@ApiTags('interviews')
@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Get('candidate/:candidateId')
  @ApiOperation({ summary: '候補者の面接一覧を取得' })
  findByCandidateId(@Param('candidateId') candidateId: string) {
    return this.interviewsService.findByCandidateId(candidateId);
  }

  @Post()
  @ApiOperation({ summary: '面接を新規登録' })
  create(@Body() createInterviewDto: CreateInterviewDto) {
    return this.interviewsService.create(createInterviewDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '面接情報を更新' })
  update(@Param('id') id: string, @Body() updateInterviewDto: UpdateInterviewDto) {
    return this.interviewsService.update(id, updateInterviewDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '面接を削除' })
  remove(@Param('id') id: string) {
    return this.interviewsService.remove(id);
  }
}