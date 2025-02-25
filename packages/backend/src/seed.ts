import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobPosting } from './job-postings/entities/job-posting.entity';
import { Candidate } from './candidates/entities/candidate.entity';
import { Interview } from './interviews/entities/interview.entity';
import { Evaluation } from './evaluations/entities/evaluation.entity';
import { EntityManager } from 'typeorm';
import { DataSource } from 'typeorm';

async function clearDatabase(manager: EntityManager) {
  try {
    await manager.query('PRAGMA foreign_keys = OFF');
    await manager.query('DELETE FROM evaluation');
    await manager.query('DELETE FROM interview');
    await manager.query('DELETE FROM candidate');
    await manager.query('DELETE FROM job_posting');
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

  try {
    // トランザクション内でデータをクリアと挿入
    await dataSource.transaction(async manager => {
      // データベースをクリア
      await clearDatabase(manager);

  // 求人データ
  const jobPostings = await Promise.all([
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
  ].map(posting => jobPostingRepo.save(posting)));

  // 候補者データ
  for (const jobPosting of jobPostings) {
    const candidates = await Promise.all([
      {
        name: `山田 太郎 (${jobPosting.title})`,
        email: `taro.yamada.${jobPosting.id}@example.com`,
        role: jobPosting.title,
        status: 'reviewing',
        experience: 5,
        skills: jobPosting.preferredSkills.slice(0, 3),
        appliedDate: new Date('2024-03-15'),
        notes: '技術力が高く、コミュニケーション能力も良好。',
        source: 'リファラル',
        location: jobPosting.location,
        expectedSalary: jobPosting.salaryRangeMin + 1000000,
        currentSalary: jobPosting.salaryRangeMin,
        jobPosting,
      },
      {
        name: `鈴木 花子 (${jobPosting.title})`,
        email: `hanako.suzuki.${jobPosting.id}@example.com`,
        role: jobPosting.title,
        status: 'interviewed',
        experience: 3,
        skills: jobPosting.preferredSkills.slice(1, 4),
        appliedDate: new Date('2024-03-14'),
        notes: '技術面接完了。チームとの相性が良さそう。',
        source: '転職サイト',
        location: jobPosting.location,
        expectedSalary: jobPosting.salaryRangeMin + 500000,
        jobPosting,
      },
      {
        name: `佐藤 健一 (${jobPosting.title})`,
        email: `kenichi.sato.${jobPosting.id}@example.com`,
        role: jobPosting.title,
        status: 'offered',
        experience: 4,
        skills: jobPosting.preferredSkills,
        appliedDate: new Date('2024-03-01'),
        notes: '即戦力として期待できる。',
        source: '社員紹介',
        location: jobPosting.location,
        expectedSalary: jobPosting.salaryRangeMax - 1000000,
        currentSalary: jobPosting.salaryRangeMin + 1500000,
        jobPosting,
      },
    ].map(candidate => candidateRepo.save(candidate)));

    // 面接データ
    for (const candidate of candidates) {
      const interviews = await Promise.all([
        {
          type: 'initial',
          date: '2024-03-20',
          time: '14:00',
          interviewer: '鈴木 部長',
          location: 'online',
          status: 'scheduled',
          candidate,
        },
        {
          type: 'technical',
          date: '2024-03-25',
          time: '15:00',
          interviewer: '田中 リードエンジニア',
          location: 'office',
          status: 'scheduled',
          candidate,
        },
      ].map(interview => interviewRepo.save(interview)));

      // 評価データ
      if (candidate.status === 'interviewed' || candidate.status === 'offered') {
        await Promise.all([
          {
            evaluator: '田中 リードエンジニア',
            date: new Date('2024-03-18'),
            technicalSkills: 4,
            communication: 5,
            problemSolving: 4,
            teamwork: 5,
            culture: 4,
            comments: 'コミュニケーション能力が高く、技術力も十分。チームに良い影響を与えられる人材。',
            candidate,
          },
        ].map(evaluation => evaluationRepo.save(evaluation)));
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