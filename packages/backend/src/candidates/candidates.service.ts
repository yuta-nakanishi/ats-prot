import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate, CandidateStatus } from './entities/candidate.entity';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { nanoid } from 'nanoid';

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'resumes');

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private candidatesRepository: Repository<Candidate>,
  ) {
    // アップロードディレクトリが存在しない場合は作成
    this.ensureUploadDirExists();
  }

  private async ensureUploadDirExists() {
    try {
      await mkdirAsync(UPLOAD_DIR, { recursive: true });
    } catch (error) {
      console.error('Failed to create upload directory:', error);
    }
  }

  async findAll(status?: string, companyId?: string): Promise<Candidate[]> {
    const whereClause: any = {};
    
    if (status) {
      whereClause.status = status as CandidateStatus;
    }
    
    if (companyId) {
      // 企業IDに紐づく求人に応募している候補者を検索
      return this.candidatesRepository
        .createQueryBuilder('candidate')
        .leftJoinAndSelect('candidate.jobPosting', 'jobPosting')
        .where('jobPosting.companyId = :companyId', { companyId })
        .getMany();
    }
    
    return this.candidatesRepository.find({
      where: whereClause,
      relations: ['jobPosting', 'interviews', 'evaluations']
    });
  }

  async findOne(id: string): Promise<Candidate> {
    const candidate = await this.candidatesRepository.findOne({
      where: { id },
      relations: ['jobPosting', 'interviews', 'evaluations']
    });
    if (!candidate) {
      throw new NotFoundException(`候補者ID ${id} が見つかりません`);
    }
    return candidate;
  }

  async create(createCandidateDto: CreateCandidateDto, resumeFile?: Express.Multer.File): Promise<Candidate> {
    try {
      const candidate = this.candidatesRepository.create(createCandidateDto);
      
      // 履歴書ファイルの処理
      if (resumeFile) {
        const fileName = this.generateFileName(resumeFile.originalname);
        const filePath = path.join(UPLOAD_DIR, fileName);
        
        // ファイルを保存
        await writeFileAsync(filePath, resumeFile.buffer);
        
        // 候補者データにファイル情報を追加
        candidate.resumeFileName = resumeFile.originalname;
        candidate.resumeFilePath = fileName;
      }
      
      return this.candidatesRepository.save(candidate);
    } catch (error) {
      throw new BadRequestException('候補者の登録に失敗しました: ' + error.message);
    }
  }

  async update(id: string, updateCandidateDto: UpdateCandidateDto, resumeFile?: Express.Multer.File): Promise<Candidate> {
    try {
      const candidate = await this.findOne(id);
      
      // 更新データの適用
      Object.assign(candidate, updateCandidateDto);
      
      // 履歴書ファイルの処理
      if (resumeFile) {
        // 既存ファイルの削除（存在する場合）
        if (candidate.resumeFilePath) {
          this.deleteResumeFile(candidate.resumeFilePath);
        }
        
        // 新しいファイルの保存
        const fileName = this.generateFileName(resumeFile.originalname);
        const filePath = path.join(UPLOAD_DIR, fileName);
        
        await writeFileAsync(filePath, resumeFile.buffer);
        
        // 候補者データにファイル情報を更新
        candidate.resumeFileName = resumeFile.originalname;
        candidate.resumeFilePath = fileName;
      }
      
      return this.candidatesRepository.save(candidate);
    } catch (error) {
      throw new BadRequestException('候補者情報の更新に失敗しました: ' + error.message);
    }
  }

  async remove(id: string): Promise<void> {
    const candidate = await this.findOne(id);
    
    // 候補者の履歴書ファイルがあれば削除
    if (candidate.resumeFilePath) {
      this.deleteResumeFile(candidate.resumeFilePath);
    }
    
    const result = await this.candidatesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`候補者ID ${id} が見つかりません`);
    }
  }

  async getResumeFile(id: string): Promise<{ path: string; originalName: string }> {
    const candidate = await this.findOne(id);
    
    if (!candidate.resumeFilePath || !candidate.resumeFileName) {
      throw new NotFoundException('履歴書ファイルが登録されていません');
    }
    
    const filePath = path.join(UPLOAD_DIR, candidate.resumeFilePath);
    
    // ファイルの存在確認
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('ファイルが見つかりません');
    }
    
    return {
      path: filePath,
      originalName: candidate.resumeFileName
    };
  }

  private generateFileName(originalName: string): string {
    const extension = path.extname(originalName);
    return `${nanoid()}-${Date.now()}${extension}`;
  }

  private deleteResumeFile(filePath: string): void {
    try {
      const fullPath = path.join(UPLOAD_DIR, filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error('ファイルの削除に失敗しました:', error);
    }
  }

  async updateStatus(id: string, status: CandidateStatus): Promise<Candidate> {
    const candidate = await this.findOne(id);
    candidate.status = status;
    return this.candidatesRepository.save(candidate);
  }
}