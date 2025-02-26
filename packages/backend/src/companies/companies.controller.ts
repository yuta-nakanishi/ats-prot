import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: '企業一覧を取得' })
  @ApiQuery({ name: 'include', required: false, description: '含める関連データ（例: users）' })
  async findAll(@Query('include') include?: string) {
    // includeクエリパラメータに応じて関連データを含める
    const relations = [];
    if (include) {
      const includes = include.split(',');
      if (includes.includes('users')) {
        relations.push('users');
      }
    }
    
    // 企業一覧を取得
    const companies = await this.companiesService.findAll(relations);
    
    // ユーザー数情報を追加
    const enhancedCompanies = companies.map(company => {
      const usersCount = company.users?.length || 0;
      return {
        ...company,
        usersCount
      };
    });
    
    return enhancedCompanies;
  }

  @Get(':id')
  @ApiOperation({ summary: '企業詳細を取得' })
  @ApiQuery({ name: 'include', required: false, description: '含める関連データ（例: users）' })
  async findOne(@Param('id') id: string, @Query('include') include?: string) {
    // includeクエリパラメータに応じて関連データを含める
    const relations = [];
    if (include) {
      const includes = include.split(',');
      if (includes.includes('users')) {
        relations.push('users');
      }
    }
    
    // 企業詳細を取得
    const company = await this.companiesService.findOne(id, relations);
    
    // ユーザー数情報を追加
    const usersCount = company.users?.length || 0;
    const enhancedCompany = {
      ...company,
      usersCount
    };
    
    return enhancedCompany;
  }

  @Post()
  @ApiOperation({ summary: '企業を新規登録' })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '企業情報を更新' })
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '企業を削除' })
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }

  @Post('with-admin')
  @ApiOperation({ summary: '会社を作成し、管理者ユーザーも同時に作成します' })
  @ApiResponse({ status: 201, description: '会社と管理者ユーザーが正常に作成されました。' })
  @ApiBody({ type: CreateCompanyDto })
  async createWithAdmin(@Body() createCompanyDto: CreateCompanyDto) {
    const result = await this.companiesService.createCompanyWithAdmin(createCompanyDto);
    
    // パスワードはレスポンスに含めるが、実運用では安全な方法で伝達すべき
    return {
      company: result.company,
      adminCreated: !!result.adminUser,
      temporaryPassword: result.temporaryPassword
    };
  }
} 