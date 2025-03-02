import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from './entities/email-template.entity';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';

@Injectable()
export class EmailTemplatesService {
  constructor(
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
  ) {}

  async create(createEmailTemplateDto: CreateEmailTemplateDto): Promise<EmailTemplate> {
    const template = this.emailTemplateRepository.create(createEmailTemplateDto);
    return this.emailTemplateRepository.save(template);
  }

  async findAll(): Promise<EmailTemplate[]> {
    return this.emailTemplateRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  async findByCompany(companyId: string): Promise<EmailTemplate[]> {
    return this.emailTemplateRepository.find({
      where: [
        { companyId, isActive: true }, 
        { companyId: null as any, isActive: true } // 共通テンプレートも返す
      ],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findOne({
      where: { id, isActive: true }
    });
    if (!template) {
      throw new NotFoundException(`Email template with ID ${id} not found`);
    }
    return template;
  }

  async update(id: string, updateEmailTemplateDto: UpdateEmailTemplateDto): Promise<EmailTemplate> {
    const template = await this.findOne(id);
    
    Object.assign(template, updateEmailTemplateDto);
    
    return this.emailTemplateRepository.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    
    // 論理削除
    template.isActive = false;
    
    await this.emailTemplateRepository.save(template);
  }
}
