import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, UploadedFile, Res, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { CandidateStatus } from './entities/candidate.entity';
import { diskStorage } from 'multer';
import * as path from 'path';

// Multerの設定
const multerConfig = {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: Function) => {
    const allowedMimeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new HttpException('不正なファイル形式です。PDF、DOC、DOCXのみアップロード可能です。', HttpStatus.BAD_REQUEST), false);
    }
  },
};

@ApiTags('candidates')
@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get()
  @ApiOperation({ summary: '候補者一覧を取得' })
  @ApiQuery({ name: 'status', required: false, description: '候補者のステータス' })
  @ApiQuery({ name: 'companyId', required: false, description: '企業ID' })
  findAll(
    @Query('status') status?: string,
    @Query('companyId') companyId?: string
  ) {
    return this.candidatesService.findAll(status, companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: '候補者詳細を取得' })
  @ApiParam({ name: 'id', description: '候補者ID' })
  findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '候補者を新規登録' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '履歴書・職務経歴書ファイル（PDF、DOC、DOCX）',
        },
        // その他のフィールドは CreateCandidateDto から自動生成される
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  create(
    @Body() createCandidateDto: CreateCandidateDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.candidatesService.create(createCandidateDto, file);
  }

  @Put(':id')
  @ApiOperation({ summary: '候補者情報を更新' })
  @ApiParam({ name: 'id', description: '候補者ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '履歴書・職務経歴書ファイル（PDF、DOC、DOCX）',
        },
        // その他のフィールドは UpdateCandidateDto から自動生成される
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  update(
    @Param('id') id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.candidatesService.update(id, updateCandidateDto, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: '候補者を削除' })
  @ApiParam({ name: 'id', description: '候補者ID' })
  remove(@Param('id') id: string) {
    return this.candidatesService.remove(id);
  }

  @Get(':id/resume')
  @ApiOperation({ summary: '候補者の履歴書ファイルをダウンロード' })
  @ApiParam({ name: 'id', description: '候補者ID' })
  async getResume(@Param('id') id: string, @Res() res: Response) {
    try {
      const file = await this.candidatesService.getResumeFile(id);
      res.download(file.path, file.originalName);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id/status')
  @ApiOperation({ summary: '候補者のステータスを更新' })
  @ApiParam({ name: 'id', description: '候補者ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['new', 'screening', 'interview', 'technical', 'offer', 'hired', 'rejected', 'withdrawn'],
          description: '新しいステータス',
        },
      },
      required: ['status'],
    },
  })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: CandidateStatus
  ) {
    return this.candidatesService.updateStatus(id, status);
  }
}