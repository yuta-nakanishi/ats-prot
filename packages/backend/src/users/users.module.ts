import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController, CompanyUsersController } from './users.controller';
import { User } from '../auth/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Company]),
    CompaniesModule,
  ],
  controllers: [UsersController, CompanyUsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {} 