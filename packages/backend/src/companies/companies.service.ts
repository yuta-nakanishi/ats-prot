import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { User, UserRole } from '../auth/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const company = this.companiesRepository.create(createCompanyDto);
    return this.companiesRepository.save(company);
  }

  async findAll(relations: string[] = []): Promise<Company[]> {
    return this.companiesRepository.find({
      relations: relations,
    });
  }

  async findOne(id: string, relations: string[] = ['users']): Promise<Company> {
    const company = await this.companiesRepository.findOne({
      where: { id },
      relations: relations,
    });
    
    if (!company) {
      throw new NotFoundException(`企業ID ${id} は見つかりませんでした`);
    }
    
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findOne(id);
    
    Object.assign(company, updateCompanyDto);
    
    return this.companiesRepository.save(company);
  }

  async remove(id: string): Promise<void> {
    const result = await this.companiesRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`企業ID ${id} は見つかりませんでした`);
    }
  }

  async createCompanyWithAdmin(createCompanyDto: CreateCompanyDto): Promise<{ company: Company; adminUser?: User; temporaryPassword?: string }> {
    try {
      // テナントIDが指定されていない場合、自動生成する
      if (!createCompanyDto.tenantId) {
        createCompanyDto.tenantId = createCompanyDto.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .substring(0, 15) + '-' + uuidv4().substring(0, 8);
      }

      // 会社を作成
      const company = this.companiesRepository.create(createCompanyDto);
      await this.companiesRepository.save(company);

      // 管理者メールアドレスが指定されている場合、管理者ユーザーを作成
      let adminUser: User | undefined;
      let temporaryPassword: string | undefined;

      if (createCompanyDto.adminEmail) {
        // 既存ユーザーを確認
        const existingUser = await this.usersRepository.findOne({
          where: { email: createCompanyDto.adminEmail }
        });

        if (existingUser) {
          throw new ConflictException('指定された管理者メールアドレスは既に登録されています');
        }

        // 一時パスワードを生成
        temporaryPassword = this.generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        // 管理者ユーザーを作成
        adminUser = this.usersRepository.create({
          email: createCompanyDto.adminEmail,
          password: hashedPassword,
          name: '管理者',
          companyId: company.id,
          isCompanyAdmin: true,
          role: UserRole.COMPANY_ADMIN,
        });

        await this.usersRepository.save(adminUser);
      }

      return {
        company,
        adminUser,
        temporaryPassword
      };
    } catch (error) {
      this.logger.error(`会社作成エラー: ${error.message}`, error.stack);
      throw error;
    }
  }

  // 仮パスワード生成関数
  private generateTemporaryPassword(): string {
    const length = 10;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }
} 