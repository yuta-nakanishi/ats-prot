import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JobAssignmentsService } from './job-assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { JobAssignment } from './entities/job-assignment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('job-assignments')
@Controller('job-assignments')
@UseGuards(JwtAuthGuard)
export class JobAssignmentsController {
  constructor(private readonly jobAssignmentsService: JobAssignmentsService) {}

  @Post()
  @ApiOperation({ summary: '求人に担当者を割り当てる' })
  @ApiResponse({ status: 201, description: '担当者が割り当てられました', type: JobAssignment })
  create(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.jobAssignmentsService.create(createAssignmentDto);
  }

  @Get()
  @ApiOperation({ summary: '求人の担当者一覧または特定のユーザーが担当する求人一覧を取得' })
  @ApiQuery({ name: 'jobPostingId', required: false, description: '求人ID' })
  @ApiQuery({ name: 'userId', required: false, description: 'ユーザーID' })
  @ApiResponse({ status: 200, description: '担当者割り当て一覧', type: [JobAssignment] })
  findAll(
    @Query('jobPostingId') jobPostingId?: string,
    @Query('userId') userId?: string
  ) {
    if (jobPostingId) {
      return this.jobAssignmentsService.findByJobPosting(jobPostingId);
    } else if (userId) {
      return this.jobAssignmentsService.findByUser(userId);
    } else {
      // どちらのパラメータも指定されていない場合はエラーを返す
      throw new Error('jobPostingIdかuserIdのどちらかを指定してください');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: '担当者割り当て詳細を取得' })
  @ApiParam({ name: 'id', description: '割り当てID' })
  @ApiResponse({ status: 200, description: '担当者割り当て詳細', type: JobAssignment })
  findOne(@Param('id') id: string) {
    return this.jobAssignmentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '担当者割り当てを更新' })
  @ApiParam({ name: 'id', description: '割り当てID' })
  @ApiResponse({ status: 200, description: '担当者割り当てが更新されました', type: JobAssignment })
  update(@Param('id') id: string, @Body() updateAssignmentDto: UpdateAssignmentDto) {
    return this.jobAssignmentsService.update(id, updateAssignmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '担当者割り当てを削除' })
  @ApiParam({ name: 'id', description: '割り当てID' })
  @ApiResponse({ status: 200, description: '担当者割り当てが削除されました' })
  remove(@Param('id') id: string) {
    return this.jobAssignmentsService.remove(id);
  }
} 