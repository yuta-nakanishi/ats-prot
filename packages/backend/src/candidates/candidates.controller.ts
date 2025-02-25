import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@ApiTags('candidates')
@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get()
  @ApiOperation({ summary: '候補者一覧を取得' })
  findAll(@Query('status') status?: string) {
    return this.candidatesService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: '候補者詳細を取得' })
  findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '候補者を新規登録' })
  create(@Body() createCandidateDto: CreateCandidateDto) {
    return this.candidatesService.create(createCandidateDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '候補者情報を更新' })
  update(@Param('id') id: string, @Body() updateCandidateDto: UpdateCandidateDto) {
    return this.candidatesService.update(id, updateCandidateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '候補者を削除' })
  remove(@Param('id') id: string) {
    return this.candidatesService.remove(id);
  }
}