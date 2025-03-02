import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { EmailTemplatesService } from './email-templates.service';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { EmailTemplate } from './entities/email-template.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('email-templates')
@UseGuards(JwtAuthGuard)
export class EmailTemplatesController {
  constructor(private readonly emailTemplatesService: EmailTemplatesService) {}

  @Post()
  async create(@Body() createEmailTemplateDto: CreateEmailTemplateDto): Promise<EmailTemplate> {
    return this.emailTemplatesService.create(createEmailTemplateDto);
  }

  @Get()
  async findAll(@Query('companyId') companyId?: string): Promise<EmailTemplate[]> {
    if (companyId) {
      return this.emailTemplatesService.findByCompany(companyId);
    }
    return this.emailTemplatesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<EmailTemplate> {
    return this.emailTemplatesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEmailTemplateDto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    return this.emailTemplatesService.update(id, updateEmailTemplateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.emailTemplatesService.remove(id);
  }
}
