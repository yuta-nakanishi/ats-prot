import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobPosting } from './job-postings/entities/job-posting.entity';
import { Candidate, CandidateStatus } from './candidates/entities/candidate.entity';
import { Interview } from './interviews/entities/interview.entity';
import { Evaluation } from './evaluations/entities/evaluation.entity';
import { EntityManager } from 'typeorm';
import { DataSource } from 'typeorm';
import { PermissionsService } from './permissions/permissions.service';
import { Company, CompanyPlanType } from './companies/entities/company.entity';
import { User, UserRole } from './auth/entities/user.entity';
import * as bcrypt from 'bcryptjs';

async function clearDatabase(manager: EntityManager) {
  try {
    await manager.query('PRAGMA foreign_keys = OFF');
    await manager.query('DELETE FROM evaluation');
    await manager.query('DELETE FROM interview');
    await manager.query('DELETE FROM candidate');
    await manager.query('DELETE FROM job_posting');
    await manager.query('DELETE FROM company');
    await manager.query('PRAGMA foreign_keys = ON');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

async function seed() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  const jobPostingRepo = app.get(getRepositoryToken(JobPosting));
  const candidateRepo = app.get(getRepositoryToken(Candidate));
  const interviewRepo = app.get(getRepositoryToken(Interview));
  const evaluationRepo = app.get(getRepositoryToken(Evaluation));
  const companyRepo = app.get(getRepositoryToken(Company));
  const userRepo = app.get(getRepositoryToken(User));
  const permissionsService = app.get(PermissionsService);

  try {
    // 権限の初期化
    await permissionsService.initializePermissions();
    console.log('💡 権限の初期化が完了しました');

    // トランザクション内でデータをクリアと挿入
    await dataSource.transaction(async manager => {
      // データベースをクリア
      await clearDatabase(manager);

      // テナント（企業）データのシード
      console.log('🏢 テナントデータを作成中...');
      
      const companiesToCreate = [
        {
          name: '株式会社テクノソリューション',
          tenantId: 'technosol',
          industry: 'IT',
          address: '東京都渋谷区神宮前5-52-2',
          phoneNumber: '03-1234-5678',
          websiteUrl: 'https://technosol.example.com',
          planType: CompanyPlanType.PREMIUM,
          isActive: true,
        },
        {
          name: 'グローバル商事株式会社',
          tenantId: 'global-trading',
          industry: '商社',
          address: '大阪府大阪市北区梅田3-1-3',
          phoneNumber: '06-2345-6789',
          websiteUrl: 'https://global-trading.example.com',
          planType: CompanyPlanType.ENTERPRISE,
          isActive: true,
        },
        {
          name: '未来工業株式会社',
          tenantId: 'mirai-kogyo',
          industry: '製造業',
          address: '愛知県名古屋市中区栄2-8-12',
          phoneNumber: '052-3456-7890',
          websiteUrl: 'https://mirai-kogyo.example.com',
          planType: CompanyPlanType.BASIC,
          isActive: false,
        },
        {
          name: '山田建設株式会社',
          tenantId: 'yamada-kensetsu',
          industry: '建設',
          address: '福岡県福岡市博多区博多駅前4-2-1',
          phoneNumber: '092-4567-8901',
          websiteUrl: 'https://yamada-kensetsu.example.com',
          planType: CompanyPlanType.BASIC,
          isActive: true,
        },
        {
          name: 'メディカルケア株式会社',
          tenantId: 'medical-care',
          industry: '医療',
          address: '東京都新宿区西新宿2-6-1',
          phoneNumber: '03-5678-9012',
          websiteUrl: 'https://medical-care.example.com',
          planType: CompanyPlanType.PREMIUM,
          isActive: true,
        }
      ];
      
      // テナントデータを保存
      const companies = await Promise.all(
        companiesToCreate.map(company => companyRepo.save(company))
      );
      
      console.log(`✅ ${companies.length}件のテナントデータを作成しました`);
      
      // テナント管理者の作成
      console.log('👤 テナント管理者ユーザーを作成中...');
      
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      const adminUsers = [
        {
          email: 'admin@technosol.example.com',
          name: '鈴木 一郎',
          password: hashedPassword,
          role: UserRole.COMPANY_ADMIN,
          company: companies[0],
          isCompanyAdmin: true,
          isActive: true,
          isSuperAdmin: false,
        },
        {
          email: 'admin@global-trading.example.com',
          name: '田中 花子',
          password: hashedPassword,
          role: UserRole.COMPANY_ADMIN,
          company: companies[1],
          isCompanyAdmin: true,
          isActive: true,
          isSuperAdmin: false,
        },
        {
          email: 'admin@medical-care.example.com',
          name: '佐藤 健太',
          password: hashedPassword,
          role: UserRole.COMPANY_ADMIN,
          company: companies[4],
          isCompanyAdmin: true,
          isActive: true,
          isSuperAdmin: false,
        }
      ];
      
      await Promise.all(adminUsers.map(user => userRepo.save(user)));
      console.log(`✅ ${adminUsers.length}件のテナント管理者ユーザーを作成しました`);

      // 求人データ
      console.log('💼 求人データを作成中...');
      
      const jobPostingsData = [
        // 開発部門の求人
        {
          title: 'シニアフロントエンドエンジニア',
          department: '開発部',
          location: '東京',
          employmentType: 'full-time',
          status: 'open',
          description: 'モダンなWebアプリケーションの開発をリードする経験豊富なフロントエンドエンジニアを募集しています。',
          requirements: ['5年以上のフロントエンド開発経験', 'React/TypeScriptでの開発経験', 'チームリーディング経験'],
          preferredSkills: ['Next.js', 'GraphQL', 'CI/CD', 'AWS'],
          salaryRangeMin: 6000000,
          salaryRangeMax: 10000000,
          postedDate: new Date('2024-02-01'),
        },
        {
          title: 'バックエンドエンジニア',
          department: '開発部',
          location: '大阪',
          employmentType: 'full-time',
          status: 'open',
          description: 'マイクロサービスアーキテクチャを用いたバックエンド開発を担当していただきます。',
          requirements: ['3年以上のバックエンド開発経験', 'Python/Djangoでの開発経験', 'RDBMSの実務経験'],
          preferredSkills: ['Kubernetes', 'Docker', 'AWS', 'マイクロサービス'],
          salaryRangeMin: 5000000,
          salaryRangeMax: 8000000,
          postedDate: new Date('2024-02-15'),
        },
        {
          title: 'モバイルアプリエンジニア',
          department: 'モバイル開発部',
          location: '東京',
          employmentType: 'full-time',
          status: 'open',
          description: 'iOSおよびAndroidアプリの開発を担当していただきます。',
          requirements: ['Swift/Kotlinでの開発経験', 'アプリのリリース経験', 'ユニットテストの実装経験'],
          preferredSkills: ['Flutter', 'React Native', 'CI/CD', 'Firebase'],
          salaryRangeMin: 5500000,
          salaryRangeMax: 9000000,
          postedDate: new Date('2024-03-01'),
        },
        // 新たに追加した求人データ
        {
          title: 'UI/UXデザイナー',
          department: 'デザイン部',
          location: '東京',
          employmentType: 'full-time',
          status: 'open',
          description: '直感的でユーザーフレンドリーなインターフェースのデザインを担当していただきます。',
          requirements: ['3年以上のUI/UXデザイン経験', 'Figmaの実務経験', 'ユーザーリサーチ経験'],
          preferredSkills: ['Adobe XD', 'Sketch', 'プロトタイピング', 'ユーザビリティテスト'],
          salaryRangeMin: 5000000,
          salaryRangeMax: 8500000,
          postedDate: new Date('2024-02-20'),
        },
        {
          title: 'インフラエンジニア',
          department: 'インフラ部',
          location: '東京',
          employmentType: 'full-time',
          status: 'open',
          description: 'クラウドインフラの設計・構築・運用を担当していただきます。',
          requirements: ['クラウドインフラの実務経験', 'AWS/GCPの知識', 'Linux管理経験'],
          preferredSkills: ['Terraform', 'Ansible', 'Kubernetes', 'CI/CD'],
          salaryRangeMin: 6000000,
          salaryRangeMax: 9500000,
          postedDate: new Date('2024-02-10'),
        },
        {
          title: 'データサイエンティスト',
          department: '分析部',
          location: '東京',
          employmentType: 'full-time',
          status: 'open',
          description: 'ビッグデータを分析し、ビジネス上の意思決定に役立つインサイトを提供していただきます。',
          requirements: ['データ分析の実務経験', 'Python/Rでの分析経験', '統計学の知識'],
          preferredSkills: ['機械学習', 'ディープラーニング', 'SQL', 'Tableau'],
          salaryRangeMin: 6500000,
          salaryRangeMax: 10000000,
          postedDate: new Date('2024-02-25'),
        },
        {
          title: 'QAエンジニア',
          department: '品質保証部',
          location: '大阪',
          employmentType: 'full-time',
          status: 'open',
          description: '製品の品質を保証するためのテスト戦略の策定と実行を担当していただきます。',
          requirements: ['3年以上のQA経験', 'テスト自動化経験', 'テスト計画策定経験'],
          preferredSkills: ['Selenium', 'Cypress', 'JUnit', 'CI/CD'],
          salaryRangeMin: 5000000,
          salaryRangeMax: 7500000,
          postedDate: new Date('2024-03-05'),
        }
      ];
      
      // 最初の会社に紐づけて求人データを保存
      const companyId = companies[0].id;
      const jobPostings = await Promise.all(
        jobPostingsData.map(jobData => {
          return jobPostingRepo.save({
            ...jobData,
            companyId
          });
        })
      );
      
      console.log(`✅ ${jobPostings.length}件の求人データを作成しました`);

      // 候補者データの追加
      console.log('👤 候補者データを作成中...');

      const candidatesToCreate = [
        {
          name: '山田 太郎',
          email: 'yamada.taro@example.com',
          phone: '090-1234-5678',
          position: 'フロントエンドエンジニア',
          status: 'screening',
          experience: 5,
          skills: ['React', 'TypeScript', 'Node.js'],
          source: 'referral',
          location: '東京',
          expectedSalary: '700万円',
          currentCompany: '株式会社テックスタート',
          availableFrom: '1ヶ月後',
          birthDate: '1990-05-15',
          education: `
- 東京大学 工学部 情報工学科 卒業 (2014年)
- プログラミングスクールA 受講 (2016年)
          `,
          notes: '前職ではECサイトのフロントエンド開発を担当。チームリーダーとしての経験もあり。',
          urls: {
            website: 'https://yamada-portfolio.example.com',
            linkedin: 'https://linkedin.com/in/taro-yamada',
            github: 'https://github.com/taroyamada'
          },
          rating: 4,
          jobId: jobPostings[0].id // 最初の求人に紐づける
        },
        {
          name: '佐藤 花子',
          email: 'sato.hanako@example.com',
          phone: '080-9876-5432',
          position: 'バックエンドエンジニア',
          status: 'interview',
          experience: 3,
          skills: ['Java', 'Spring Boot', 'MySQL'],
          source: 'indeed',
          location: '大阪',
          expectedSalary: '600万円',
          currentCompany: '株式会社システムデザイン',
          availableFrom: '2ヶ月後',
          birthDate: '1992-08-20',
          education: `
- 大阪大学 理学部 情報科学科 卒業 (2016年)
          `,
          notes: '基幹システムの開発経験あり。マイクロサービスアーキテクチャに興味がある。',
          urls: {
            linkedin: 'https://linkedin.com/in/hanako-sato',
            github: 'https://github.com/hanakosato'
          },
          rating: 3,
          jobId: jobPostings[1].id // 2番目の求人に紐づける
        },
        {
          name: '鈴木 一郎',
          email: 'suzuki.ichiro@example.com',
          phone: '070-1111-2222',
          position: 'UIデザイナー',
          status: 'technical',
          experience: 7,
          skills: ['Figma', 'Adobe XD', 'UI/UX', 'HTML/CSS'],
          source: 'referral',
          location: '東京',
          expectedSalary: '650万円',
          currentCompany: '株式会社クリエイティブラボ',
          availableFrom: '即日',
          birthDate: '1988-12-05',
          education: `
- 多摩美術大学 デザイン学科 卒業 (2010年)
          `,
          notes: 'ECサイトやSaaSプロダクトのUIデザイン経験が豊富。ユーザーテスト経験あり。',
          urls: {
            website: 'https://suzuki-design.example.com',
            linkedin: 'https://linkedin.com/in/ichiro-suzuki'
          },
          rating: 5,
          jobId: jobPostings[2].id // 3番目の求人に紐づける
        },
        {
          name: '田中 直樹',
          email: 'tanaka.naoki@example.com',
          phone: '090-3333-4444',
          position: 'プロジェクトマネージャー',
          status: 'offer',
          experience: 10,
          skills: ['Agile', 'Scrum', 'JIRA', 'Confluence'],
          source: 'linkedin',
          location: '東京',
          expectedSalary: '900万円',
          currentCompany: '株式会社ビジネスソリューションズ',
          availableFrom: '3ヶ月後',
          birthDate: '1984-03-10',
          education: `
- 早稲田大学 商学部 卒業 (2008年)
- PMP認定 (2015年)
          `,
          notes: '大規模Webサービスの開発プロジェクトをリード。チーム規模最大15名。',
          urls: {
            linkedin: 'https://linkedin.com/in/naoki-tanaka'
          },
          rating: 4,
          jobId: jobPostings[3].id // 4番目の求人に紐づける
        },
        {
          name: '伊藤 美咲',
          email: 'ito.misaki@example.com',
          phone: '080-5555-6666',
          position: 'カスタマーサポート',
          status: 'rejected',
          experience: 2,
          skills: ['カスタマーサービス', 'Zendesk', 'Excel'],
          source: 'indeed',
          location: '大阪',
          expectedSalary: '400万円',
          currentCompany: '株式会社サポートセンター',
          availableFrom: '即日',
          birthDate: '1995-07-23',
          education: `
- 関西大学 文学部 卒業 (2018年)
          `,
          notes: 'コールセンターでの勤務経験あり。英語対応可能（TOEIC 780点）。',
          urls: {},
          rating: 2,
          jobId: jobPostings[4].id // 5番目の求人に紐づける
        }
      ];

      // 候補者データを保存
      const candidates = await Promise.all(
        candidatesToCreate.map(candidateData => candidateRepo.save(candidateData))
      );

      console.log(`✅ ${candidates.length}件の候補者データを作成しました`);

      // 面接データの生成
      console.log('📅 面接データを作成中...');
      
      // 各候補者に対して面接データを生成
      const interviews = [];
      
      for (const candidate of candidates) {
        // 候補者のステータスに応じて面接データを生成
        if (candidate.status === 'screening') {
          // 一次面接が予定されている
          interviews.push(
            await interviewRepo.save({
              candidate,
              type: 'initial',
              date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1週間後
              time: '14:00', // 時間フィールドに値を設定
              location: 'online',
              status: 'scheduled',
              interviewer: '鈴木 一郎, 田中 花子' // 面接官を文字列として設定
            })
          );
        } else if (candidate.status === 'interview' || candidate.status === 'technical' || candidate.status === 'offer') {
          // 一次面接が完了している
          interviews.push(
            await interviewRepo.save({
              candidate,
              type: 'initial',
              date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2週間前
              time: '10:30', // 時間フィールドに値を設定
              location: 'online',
              status: 'completed',
              interviewer: '鈴木 一郎, 田中 花子', // 面接官を文字列として設定
              feedback: '基本的なスキルとコミュニケーション能力は良好。次のステップに進めてよい。'
            })
          );
          
          if (candidate.status === 'technical' || candidate.status === 'offer') {
            // 二次面接（技術面接）が完了している
            interviews.push(
              await interviewRepo.save({
                candidate,
                type: 'technical',
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1週間前
                time: '15:00', // 時間フィールドに値を設定
                location: 'office',
                status: 'completed',
                interviewer: '佐藤 健太, 高橋 誠', // 面接官を文字列として設定
                feedback: '技術的な知識は十分。実務経験も豊富で即戦力として期待できる。'
              })
            );
            
            if (candidate.status === 'offer') {
              // 最終面接が完了している
              interviews.push(
                await interviewRepo.save({
                  candidate,
                  type: 'final',
                  date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3日前
                  time: '11:00', // 時間フィールドに値を設定
                  location: 'office',
                  status: 'completed',
                  interviewer: '山本 社長, 鈴木 副社長', // 面接官を文字列として設定
                  feedback: '人柄も良く、会社の文化にもフィットする。オファーを出すことを推奨する。'
                })
              );
            }
          }
        }
      }
      
      console.log(`✅ ${interviews.length}件の面接データを作成しました`);
      
      // スーパー管理者ユーザーの作成
      console.log('👤 スーパー管理者ユーザーを作成中...');
      
      const superAdminUser = {
        email: 'superadmin@example.com',
        name: 'スーパー管理者',
        password: await bcrypt.hash('superadminpassword123', await bcrypt.genSalt()),
        role: UserRole.COMPANY_ADMIN, // SUPER_ADMINがないので代わりにCOMPANY_ADMINを使用
        isSuperAdmin: true,
        isActive: true,
      };
      
      await userRepo.save(superAdminUser);
      console.log('✅ スーパー管理者ユーザーを作成しました');
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    // 必ずアプリケーションを終了
    await app.close();
  }
  console.log('✨ シードデータの作成が完了しました！');
}

seed().catch(error => {
  console.error('Error seeding data:', error);
  process.exit(1);
});