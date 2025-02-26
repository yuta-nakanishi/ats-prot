import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { CandidatesModule } from './candidates/candidates.module';
import { JobPostingsModule } from './job-postings/job-postings.module';
import { InterviewsModule } from './interviews/interviews.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { PermissionsModule } from './permissions/permissions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'sqlite',
        database: join(__dirname, '..', 'recruitment.sqlite'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        // SQLite接続の最適化
        extra: {
          // WALモードを有効化してパフォーマンスと同時アクセスを改善
          journal_mode: 'WAL',
          // ビジートタイムアウトを30秒に設定
          busy_timeout: 30000,
          // 同期モードを通常に設定
          synchronous: 'NORMAL',
          // テンポラリストアをメモリに設定
          temp_store: 'MEMORY',
          // 外部キー制約を有効化
          foreign_keys: 'ON'
        },
        // 接続の再試行設定
        retryAttempts: 10,
        retryDelay: 3000,
        // 接続プールの設定
        enableWAL: true,
        // デバッグモードを有効化
        logging: true
      }),
      inject: [ConfigService],
    }),
    CandidatesModule,
    JobPostingsModule,
    InterviewsModule,
    EvaluationsModule,
    AuthModule,
    CompaniesModule,
    PermissionsModule,
    UsersModule,
  ],
})
export class AppModule {}