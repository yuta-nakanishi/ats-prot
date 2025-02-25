import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JobPostingsService } from './job-postings.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';

@ApiTags('job-postings')
@Controller('job-postings')
export class JobPostingsController {
  constructor(private readonly jobPostingsService: JobPostingsService) {}

  @Get()
  @ApiOperation({ summary: '求人一覧を取得' })
  findAll(@Query('status') status?: string) {
    return this.jobPostingsService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: '求人詳細を取得' })
  findOne(@Param('id') id: string) {
    return this.jobPostingsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '求人を新規登録' })
  create(@Body() createJobPostingDto: CreateJobPostingDto) {
    return this.jobPostingsService.create(createJobPostingDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '求人情報を更新' })
  update(@Param('id') id: string, @Body() updateJobPostingDto: UpdateJobPostingDto) {
    return this.jobPostingsService.update(id, updateJobPostingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '求人を削除' })
  remove(@Param('id') id: string) {
    return this.jobPostingsService.remove(id);
  }
}