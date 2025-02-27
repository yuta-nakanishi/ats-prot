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
import { JobAssignment } from './job-assignments/entities/job-assignment.entity';
import { AssignmentRole } from './job-assignments/entities/job-assignment.entity';
import * as bcrypt from 'bcryptjs';

async function clearDatabase(manager: EntityManager) {
  try {
    await manager.query('PRAGMA foreign_keys = OFF');
    
    // 削除順序を依存関係に合わせて変更
    // まず依存しているテーブルから削除
    await manager.query('DELETE FROM evaluation');
    await manager.query('DELETE FROM interview');
    await manager.query('DELETE FROM job_assignment');
    await manager.query('DELETE FROM candidate');
    await manager.query('DELETE FROM job_posting');
    await manager.query('DELETE FROM user');
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

      // 求人データの生成
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
      
      // 求人データを保存
      const jobPostings = await Promise.all(
        jobPostingsData.map((jobData, index) => {
          // 明示的にcompanyIdを設定
          const company = companies[index % companies.length];
          return jobPostingRepo.save({
            ...jobData,
            company: company,
            companyId: company.id
          });
        })
      );
      
      console.log(`✅ ${jobPostings.length}件の求人データを作成しました`);

      // 候補者データの生成（各会社に紐づける）
      console.log('👨‍💼 候補者データを作成中...');
      
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
            linkedin: 'https://linkedin.com/in/taroyamada',
            github: 'https://github.com/yamada-taro',
          },
          company: companies[0], // 株式会社テクノソリューション
          appliedAt: new Date('2024-03-15'),
          jobId: '', // 後でjobPostingsと関連付ける
        },
        {
          name: '佐藤 花子',
          email: 'sato.hanako@example.com',
          phone: '080-2345-6789',
          position: 'UIデザイナー',
          status: 'interview',
          experience: 3,
          skills: ['Figma', 'Adobe XD', 'HTML/CSS'],
          source: 'indeed',
          location: '東京',
          expectedSalary: '550万円',
          currentCompany: 'デザインスタジオB',
          availableFrom: '2ヶ月後',
          birthDate: '1992-10-08',
          education: '多摩美術大学 デザイン学科 卒業 (2015年)',
          notes: 'UI/UXデザインに強み。ユーザー調査経験あり。',
          urls: {
            portfolio: 'https://hanakodesign.com',
          },
          company: companies[0], // 株式会社テクノソリューション
          appliedAt: new Date('2024-03-14'),
          jobId: '', // 後でjobPostingsと関連付ける
        },
        {
          name: '鈴木 一郎',
          email: 'suzuki.ichiro@example.com',
          phone: '070-3456-7890',
          position: 'バックエンドエンジニア',
          status: 'new',
          experience: 7,
          skills: ['Java', 'Spring', 'MySQL', 'AWS'],
          source: 'linkedin',
          location: '大阪',
          expectedSalary: '800万円',
          currentCompany: '株式会社テクノソリューションズ',
          availableFrom: 'すぐに可能',
          birthDate: '1987-06-22',
          education: '京都大学 情報学科 卒業 (2010年)',
          notes: 'エンタープライズシステムの開発経験豊富。チームリード経験あり。',
          urls: {
            github: 'https://github.com/ichiro-suzuki',
            linkedin: 'https://linkedin.com/in/ichirosuzuki',
          },
          company: companies[1], // グローバル商事株式会社
          appliedAt: new Date('2024-04-01'),
          jobId: '', // 後でjobPostingsと関連付ける
        },
        {
          name: '田中 健太',
          email: 'tanaka.kenta@example.com',
          phone: '090-4567-8901',
          position: 'データサイエンティスト',
          status: 'technical',
          experience: 4,
          skills: ['Python', 'R', 'TensorFlow', 'SQL'],
          source: 'company_website',
          location: '東京',
          expectedSalary: '650万円',
          currentCompany: 'データアナリティクス株式会社',
          availableFrom: '応相談',
          birthDate: '1991-12-03',
          education: '東京工業大学 情報理工学研究科 修了 (2016年)',
          notes: '機械学習モデルの構築と実装経験あり。ビジネス課題解決志向。',
          urls: {
            github: 'https://github.com/kenta-tanaka',
          },
          company: companies[0], // 株式会社テクノソリューション
          appliedAt: new Date('2024-03-25'),
          jobId: '', // 後でjobPostingsと関連付ける
        },
        {
          name: '伊藤 美咲',
          email: 'ito.misaki@example.com',
          phone: '080-5678-9012',
          position: 'プロジェクトマネージャー',
          status: 'offer',
          experience: 6,
          skills: ['Agile', 'Scrum', 'JIRA', 'プロジェクト管理'],
          source: 'referral',
          location: '東京',
          expectedSalary: '750万円',
          currentCompany: 'ITソリューションズ株式会社',
          availableFrom: '3ヶ月後',
          birthDate: '1989-08-17',
          education: '早稲田大学 経営学部 卒業 (2012年)',
          notes: '複数の大規模プロジェクトをリード。顧客折衝能力に優れる。',
          company: companies[0], // 株式会社テクノソリューション
          appliedAt: new Date('2024-03-10'),
          jobId: '', // 後でjobPostingsと関連付ける
        }
      ];
      
      // 候補者データを作成する前に、求人IDを割り当てる
      candidatesToCreate[0].jobId = jobPostings[0].id; // 山田太郎 -> シニアフロントエンドエンジニア
      candidatesToCreate[1].jobId = jobPostings[3].id; // 佐藤花子 -> UI/UXデザイナー
      candidatesToCreate[2].jobId = jobPostings[1].id; // 鈴木一郎 -> バックエンドエンジニア
      candidatesToCreate[3].jobId = jobPostings[5].id; // 田中健太 -> データサイエンティスト
      candidatesToCreate[4].jobId = jobPostings[0].id; // 伊藤美咲 -> シニアフロントエンドエンジニア
      
      const candidates = await Promise.all(
        candidatesToCreate.map(candidateData => {
          // 該当する求人を見つける
          const jobPosting = jobPostings.find(job => job.id === candidateData.jobId);
          return candidateRepo.save({
            ...candidateData,
            // jobPostingを設定して関連付け
            jobPosting: jobPosting
          });
        })
      );

      console.log(`✅ ${candidates.length}件の候補者データを作成しました`);

      // 面接データの生成
      console.log('📅 面接データを作成中...');
      
      // 各候補者に対して面接データを生成
      const interviews = [];
      
      // 今日の日付を取得
      const today = new Date();
      
      // 今週と来週の日付を計算
      const thisWeekDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        thisWeekDates.push(date);
      }
      
      const nextWeekDates = [];
      for (let i = 7; i < 14; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        nextWeekDates.push(date);
      }
      
      for (const candidate of candidates) {
        // 候補者のステータスに応じて面接データを生成
        if (candidate.status === 'screening') {
          // 一次面接が予定されている
          interviews.push(
            await interviewRepo.save({
              candidate,
              type: 'initial',
              date: thisWeekDates[1], // 明日
              time: '14:00', // 時間フィールドに値を設定
              location: 'online',
              status: 'scheduled',
              interviewer: '鈴木 一郎, 田中 花子' // 面接官を文字列として設定
            })
          );
        } else if (candidate.status === 'interview') {
          // 一次面接が完了している
          interviews.push(
            await interviewRepo.save({
              candidate,
              type: 'initial',
              date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5日前
              time: '15:00',
              location: 'online',
              status: 'completed',
              interviewer: '鈴木 一郎',
              feedback: '基本的なスキルは高い。コミュニケーション能力も良好。次の面接に進めるべき。'
            })
          );
          
          // 次の面接が予定されている
          interviews.push(
            await interviewRepo.save({
              candidate,
              type: 'technical',
              date: thisWeekDates[3], // 3日後
              time: '10:00',
              location: 'office',
              status: 'scheduled',
              interviewer: '高橋 修, 佐々木 健太'
            })
          );
        } else if (candidate.status === 'technical') {
          // 技術面接が完了
          interviews.push(
            await interviewRepo.save({
              candidate,
              type: 'initial',
              date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), // 10日前
              time: '14:00',
              location: 'online',
              status: 'completed',
              interviewer: '鈴木 一郎',
              feedback: '基本的なスキルは問題なし。次のステップに進めるべき。'
            })
          );
          
          interviews.push(
            await interviewRepo.save({
              candidate,
              type: 'technical',
              date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3日前
              time: '11:00',
              location: 'office',
              status: 'completed',
              interviewer: '高橋 修, 佐々木 健太',
              feedback: '技術的なスキルは高いレベル。特にデータモデリングが優れている。最終面接に進めるべき。'
            })
          );
          
          // 最終面接が予定されている
          interviews.push(
            await interviewRepo.save({
              candidate,
              type: 'final',
              date: thisWeekDates[4], // 4日後
              time: '16:00',
              location: 'office',
              status: 'scheduled',
              interviewer: '渡辺 社長, 鈴木 一郎'
            })
          );
        } else if (candidate.status === 'offer') {
          // すべての面接が完了している
          interviews.push(
            await interviewRepo.save({
              candidate,
              type: 'initial',
              date: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000), // 15日前
              time: '10:00',
              location: 'online',
              status: 'completed',
              interviewer: '鈴木 一郎',
              feedback: '経験豊富で知識も十分。次のステップに進めるべき。'
            })
          );
          
          interviews.push(
            await interviewRepo.save({
              candidate,
              type: 'technical',
              date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), // 10日前
              time: '14:00',
              location: 'office',
              status: 'completed',
              interviewer: '高橋 修, 佐々木 健太',
              feedback: 'プロジェクト管理スキルは非常に高い。チームリーダーとしての経験も豊富。'
            })
          );
          
          interviews.push(
            await interviewRepo.save({
              candidate,
              type: 'final',
              date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5日前
              time: '16:00',
              location: 'office',
              status: 'completed',
              interviewer: '渡辺 社長, 鈴木 一郎',
              feedback: '非常に優秀な候補者。是非採用したい。'
            })
          );
        } else if (candidate.status === 'new') {
          // これから最初の面接を行う
          interviews.push(
            await interviewRepo.save({
              candidate,
              type: 'initial',
              date: thisWeekDates[2], // 2日後
              time: '11:00',
              location: 'online',
              status: 'scheduled',
              interviewer: '田中 花子'
            })
          );
        }
      }
      
      console.log(`✅ ${interviews.length}件の面接データを作成しました`);
      
      // 評価データの生成
      console.log('💯 評価データを作成中...');
      
      const evaluations = [];
      
      // 面接が完了している候補者に対して評価データを生成
      for (const interview of interviews) {
        if (interview.status === 'completed') {
          const evaluation = {
            candidate: interview.candidate,
            evaluator: interview.interviewer.split(',')[0].trim(), // 最初の面接官
            technicalSkills: Math.floor(Math.random() * 3) + 3, // 3-5のスコア
            communication: Math.floor(Math.random() * 3) + 3, // 3-5のスコア
            problemSolving: Math.floor(Math.random() * 3) + 3, // 3-5のスコア
            teamwork: Math.floor(Math.random() * 3) + 3, // 3-5のスコア
            culture: Math.floor(Math.random() * 3) + 3, // 3-5のスコア
            comments: interview.feedback || 'スキルと経験は十分。チームにマッチするでしょう。',
            date: new Date(interview.date.getTime() + 2 * 60 * 60 * 1000), // 面接の2時間後
          };
          
          evaluations.push(await evaluationRepo.save(evaluation));
        }
      }
      
      console.log(`✅ ${evaluations.length}件の評価データを作成しました`);
      
      // JobAssignmentデータの作成
      console.log('👥 求人担当者データを作成中...');
      
      // サービスのインポートと取得
      const jobAssignmentRepo = app.get(getRepositoryToken(JobAssignment));
      
      const jobAssignments = [];
      
      // 各求人に担当者を割り当てる
      for (const jobPosting of jobPostings) {
        // 会社の管理者ユーザーを見つける
        const userList = await userRepo.find({ where: { companyId: jobPosting.companyId } });
        if (userList.length > 0) {
          const adminUser = userList[0]; // 会社に属する最初のユーザー
          jobAssignments.push(
            await jobAssignmentRepo.save({
              userId: adminUser.id,
              user: adminUser,
              jobPostingId: jobPosting.id,
              jobPosting: jobPosting,
              role: AssignmentRole.PRIMARY,
              notificationsEnabled: true,
              notes: '主担当者として全体を管理',
              createdAt: new Date(),
              updatedAt: new Date()
            })
          );
        }
      }
      
      console.log(`✅ ${jobAssignments.length}件の求人担当者データを作成しました`);
      
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