import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';
import { Interview } from './entities/interview.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Interview])],
  controllers: [InterviewsController],
  providers: [InterviewsService],
})
export class InterviewsModule {}