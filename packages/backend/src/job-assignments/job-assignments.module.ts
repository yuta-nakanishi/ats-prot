import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobAssignmentsService } from './job-assignments.service';
import { JobAssignmentsController } from './job-assignments.controller';
import { JobAssignment } from './entities/job-assignment.entity';
import { User } from '../auth/entities/user.entity';
import { JobPosting } from '../job-postings/entities/job-posting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobAssignment, User, JobPosting]),
  ],
  controllers: [JobAssignmentsController],
  providers: [JobAssignmentsService],
  exports: [JobAssignmentsService],
})
export class JobAssignmentsModule {} 