import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';
import { Department } from './entities/department.entity';
import { Team } from './entities/team.entity';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { User } from '../auth/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, Department, Team, User]),
    PermissionsModule,
    AuthModule
  ],
  controllers: [CompaniesController, DepartmentsController, TeamsController],
  providers: [CompaniesService, DepartmentsService, TeamsService],
  exports: [CompaniesService, DepartmentsService, TeamsService],
})
export class CompaniesModule {} 