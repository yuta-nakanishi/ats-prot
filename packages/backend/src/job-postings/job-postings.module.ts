import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostingsController } from './job-postings.controller';
import { JobPostingsService } from './job-postings.service';
import { JobPosting } from './entities/job-posting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobPosting])],
  controllers: [JobPostingsController],
  providers: [JobPostingsService],
})
export class JobPostingsModule {}