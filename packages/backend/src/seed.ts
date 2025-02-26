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
  const jobPostings = await Promise.all([
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
    },
    {
      title: 'プロジェクトマネージャー',
      department: 'プロジェクト管理部',
      location: '東京',
      employmentType: 'full-time',
      status: 'open',
      description: '開発プロジェクトの計画・実行・監視・制御を担当していただきます。',
      requirements: ['5年以上のプロジェクト管理経験', 'PMP資格', 'アジャイル開発経験'],
      preferredSkills: ['Scrum', 'JIRA', 'Confluence', 'リスク管理'],
      salaryRangeMin: 7000000,
      salaryRangeMax: 12000000,
      postedDate: new Date('2024-01-15'),
    },
    {
      title: 'テクニカルサポートエンジニア',
      department: 'カスタマーサポート部',
      location: '福岡',
      employmentType: 'full-time',
      status: 'open',
      description: '顧客からの技術的な問い合わせに対応し、問題解決を支援していただきます。',
      requirements: ['IT基礎知識', 'コミュニケーション能力', '問題解決能力'],
      preferredSkills: ['Linux', 'ネットワーク', 'データベース', '英語'],
      salaryRangeMin: 4000000,
      salaryRangeMax: 6000000,
      postedDate: new Date('2024-03-10'),
    },
    {
      title: 'DevOpsエンジニア',
      department: 'インフラ部',
      location: '東京',
      employmentType: 'contract',
      status: 'open',
      description: '開発と運用の架け橋となり、CI/CDパイプラインの構築・改善を担当していただきます。',
      requirements: ['CI/CD経験', 'コンテナ技術の知識', 'スクリプト言語経験'],
      preferredSkills: ['Jenkins', 'Docker', 'Kubernetes', 'GitLab CI'],
      salaryRangeMin: 6500000,
      salaryRangeMax: 9000000,
      postedDate: new Date('2024-02-05'),
    },
    {
      title: 'Webディレクター',
      department: '企画部',
      location: '大阪',
      employmentType: 'part-time',
      status: 'draft',
      description: 'Webサイト・サービスの企画・設計・ディレクションを担当していただきます。',
      requirements: ['Webディレクション経験', 'プロジェクト管理経験', 'マーケティング知識'],
      preferredSkills: ['SEO', 'UI/UX', 'コンテンツ戦略', 'アクセス解析'],
      salaryRangeMin: 5500000,
      salaryRangeMax: 8000000,
      postedDate: new Date('2024-01-20'),
      closingDate: new Date('2024-04-20'),
    },
    {
      title: 'セキュリティエンジニア',
      department: 'セキュリティ部',
      location: '東京',
      employmentType: 'full-time',
      status: 'closed',
      description: '情報セキュリティ対策の計画・実装・監視を担当していただきます。',
      requirements: ['情報セキュリティの実務経験', 'ネットワークセキュリティ知識', 'セキュリティ診断経験'],
      preferredSkills: ['ペネトレーションテスト', 'CISSP資格', 'セキュリティ監査', 'インシデント対応'],
      salaryRangeMin: 7000000,
      salaryRangeMax: 11000000,
      postedDate: new Date('2023-12-01'),
      closingDate: new Date('2024-01-31'),
    },
  ].map(posting => jobPostingRepo.save(posting)));

  // 候補者データの生成関数
  const createCandidates = async (jobPosting: JobPosting, statuses: CandidateStatus[]) => {
    const candidateDataTemplates = [
      // 高スキル・高経験の候補者
      {
        namePrefix: '山田',
        experienceBase: 8,
        skillsCount: 4,
        expectedSalaryRatio: 1.2,
        sourceOptions: ['リファラル', '社員紹介', 'ヘッドハンティング'],
        notesTemplates: [
          '技術力が高く、コミュニケーション能力も良好。リーダーシップ経験あり。',
          '即戦力として期待できる。前職では大規模プロジェクトをリード。',
          '専門性が高く、業界での知名度もあり。技術記事の執筆経験多数。'
        ]
      },
      // 中堅レベルの候補者
      {
        namePrefix: '鈴木',
        experienceBase: 4,
        skillsCount: 3,
        expectedSalaryRatio: 1.1,
        sourceOptions: ['転職サイト', 'LinkedIn', '企業サイト'],
        notesTemplates: [
          '技術面接完了。チームとの相性が良さそう。成長意欲が高い。',
          '基礎スキルは十分。指導すれば成長が見込める。',
          '前職での実績は良好。新しい技術への適応力あり。'
        ]
      },
      // 若手・未経験寄りの候補者
      {
        namePrefix: '佐藤',
        experienceBase: 1,
        skillsCount: 2,
        expectedSalaryRatio: 0.9,
        sourceOptions: ['新卒採用', '転職サイト', 'インターンシップ'],
        notesTemplates: [
          '基礎知識はあるが実務経験が少ない。ポテンシャルは高い。',
          '学習意欲が高く、独学でプロジェクトを複数完成させている。',
          '若手だが技術への熱意がある。基本的なスキルは身についている。'
        ]
      }
    ];

    const lastNames = ['山田', '鈴木', '佐藤', '田中', '伊藤', '渡辺', '高橋', '中村', '小林', '加藤'];
    const firstNames = ['太郎', '花子', '健一', '涼子', '誠', '美香', '直樹', '彩', '拓也', '愛'];
    
    const candidates = [];
    
    for (const status of statuses) {
      for (const template of candidateDataTemplates) {
        const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const fullName = `${randomLastName} ${randomFirstName}`;
        
        const experience = template.experienceBase + Math.floor(Math.random() * 3);
        const skills = jobPosting.preferredSkills.slice(0, template.skillsCount);
        const source = template.sourceOptions[Math.floor(Math.random() * template.sourceOptions.length)];
        const notes = template.notesTemplates[Math.floor(Math.random() * template.notesTemplates.length)];
        
        const appliedDate = new Date();
        appliedDate.setDate(appliedDate.getDate() - Math.floor(Math.random() * 30));
        
        const expectedSalary = Math.round(jobPosting.salaryRangeMin * template.expectedSalaryRatio);
        const currentSalary = Math.round(expectedSalary * 0.9);
        
        const candidate = await candidateRepo.save({
          name: `${fullName} (${jobPosting.title})`,
          email: `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}.${jobPosting.id}@example.com`,
          role: jobPosting.title,
          status,
          experience,
          skills,
          appliedDate,
          notes,
          source,
          location: jobPosting.location,
          expectedSalary,
          currentSalary: Math.random() > 0.3 ? currentSalary : undefined, // 30%の確率で現在の給与情報なし
          jobPosting,
        });
        
        candidates.push(candidate);
      }
    }
    
    return candidates;
  };

  // 各求人に対して様々なステータスの候補者を生成
  for (const jobPosting of jobPostings) {
    // 求人のステータスに応じて異なる候補者のステータス分布を設定
    let candidateStatuses: CandidateStatus[];
    
    if (jobPosting.status === 'open') {
      candidateStatuses = ['new', 'reviewing', 'interviewed', 'offered', 'rejected'] as CandidateStatus[];
    } else if (jobPosting.status === 'closed') {
      candidateStatuses = ['interviewed', 'offered', 'rejected'] as CandidateStatus[];
    } else { // draft
      candidateStatuses = ['new', 'reviewing'] as CandidateStatus[];
    }
    
    const candidates = await createCandidates(jobPosting, candidateStatuses);

    // 面接データの生成
    for (const candidate of candidates) {
      // 候補者のステータスに応じて面接データを生成
      const interviewsToCreate = [];
      
      // 初回面接は全員に設定（ステータスは候補者のステータスに依存）
      const initialInterviewStatus = 
        candidate.status === 'new' ? 'scheduled' : 
        candidate.status === 'reviewing' ? 'scheduled' : 'completed';
      
      interviewsToCreate.push({
        type: 'initial',
        date: new Date(new Date().setDate(new Date().getDate() + (initialInterviewStatus === 'scheduled' ? 5 : -5))).toISOString().split('T')[0],
        time: `${10 + Math.floor(Math.random() * 7)}:00`,
        interviewer: '鈴木 部長',
        location: Math.random() > 0.5 ? 'online' : 'office',
        status: initialInterviewStatus,
        feedback: initialInterviewStatus === 'completed' ? '基本的なコミュニケーション能力は問題なし。次のステップに進めるレベル。' : undefined,
        candidate,
      });
      
      // reviewing以上の候補者には技術面接を設定
      if (['reviewing', 'interviewed', 'offered', 'rejected'].includes(candidate.status)) {
        const technicalInterviewStatus = 
          candidate.status === 'reviewing' ? 'scheduled' : 'completed';
        
        interviewsToCreate.push({
          type: 'technical',
          date: new Date(new Date().setDate(new Date().getDate() + (technicalInterviewStatus === 'scheduled' ? 10 : -3))).toISOString().split('T')[0],
          time: `${10 + Math.floor(Math.random() * 7)}:00`,
          interviewer: '田中 リードエンジニア',
          location: Math.random() > 0.5 ? 'online' : 'office',
          status: technicalInterviewStatus,
          feedback: technicalInterviewStatus === 'completed' ? '技術的な基礎知識は十分。実践的な経験も豊富。' : undefined,
          candidate,
        });
      }
      
      // interviewed以上の候補者にはカルチャー面接を設定
      if (['interviewed', 'offered', 'rejected'].includes(candidate.status)) {
        interviewsToCreate.push({
          type: 'cultural',
          date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0],
          time: `${13 + Math.floor(Math.random() * 5)}:00`,
          interviewer: '佐々木 人事部長',
          location: 'office',
          status: 'completed',
          feedback: '企業文化への適合性は高い。チームワークを重視する姿勢が見られる。',
          candidate,
        });
      }
      
      // offered/rejectedの候補者には最終面接を設定
      if (['offered', 'rejected'].includes(candidate.status)) {
        interviewsToCreate.push({
          type: 'final',
          date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
          time: `${15 + Math.floor(Math.random() * 3)}:00`,
          interviewer: '山本 CEO',
          location: 'office',
          status: 'completed',
          feedback: candidate.status === 'offered' 
            ? '全体的に高評価。オファーを出す方向で検討。'
            : '期待するレベルには届かなかった。他の候補者を優先したい。',
          candidate,
        });
      }
      
      await Promise.all(interviewsToCreate.map(interview => interviewRepo.save(interview)));

      // 評価データの作成
      if (['interviewed', 'offered', 'rejected'].includes(candidate.status)) {
        // 技術評価
        await evaluationRepo.save({
          evaluator: '田中 リードエンジニア',
          date: new Date(new Date().setDate(new Date().getDate() - 3)),
          technicalSkills: 3 + Math.floor(Math.random() * 3), // 3-5の範囲
          communication: 3 + Math.floor(Math.random() * 3),
          problemSolving: 3 + Math.floor(Math.random() * 3),
          teamwork: 3 + Math.floor(Math.random() * 3),
          culture: 3 + Math.floor(Math.random() * 3),
          comments: candidate.status === 'offered' 
            ? '技術的なスキルが高く、問題解決能力も優れている。チームに良い影響を与えられる人材。'
            : '基本的なスキルはあるが、期待していたレベルには達していない。もう少し経験を積むことを推奨。',
          candidate,
        });
        
        // 人事評価（offered/rejectedの場合のみ）
        if (['offered', 'rejected'].includes(candidate.status)) {
          await evaluationRepo.save({
            evaluator: '佐々木 人事部長',
            date: new Date(new Date().setDate(new Date().getDate() - 2)),
            technicalSkills: 3 + Math.floor(Math.random() * 3),
            communication: 3 + Math.floor(Math.random() * 3),
            problemSolving: 3 + Math.floor(Math.random() * 3),
            teamwork: 3 + Math.floor(Math.random() * 3),
            culture: 3 + Math.floor(Math.random() * 3),
            comments: candidate.status === 'offered'
              ? '企業文化に適合し、チームワークを重視する姿勢が見られる。コミュニケーション能力も高い。'
              : 'スキルセットは良いが、チームとの相性に懸念がある。長期的な適合性に疑問。',
            candidate,
          });
        }
      }
    }
  }
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    // 必ずアプリケーションを終了
    await app.close();
  }
  console.log('Seed data has been inserted successfully!');
}

seed().catch(error => {
  console.error('Error seeding data:', error);
  process.exit(1);
});