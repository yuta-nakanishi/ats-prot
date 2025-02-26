import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
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
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '企業詳細を取得' })
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
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