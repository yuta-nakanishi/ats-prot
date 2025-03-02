import { DataSource } from 'typeorm';
import { createConnection } from 'typeorm';

async function main() {
  console.log('Creating email_templates table...');
  
  // データベース接続の作成
  const connection = await createConnection({
    type: 'sqlite',
    database: 'recruitment.sqlite',
    synchronize: false,
    logging: true,
  });

  try {
    const queryRunner = connection.createQueryRunner();
    
    // テーブルが存在するか確認
    const tableExists = await queryRunner.hasTable('email_templates');
    if (tableExists) {
      console.log('Table email_templates already exists');
      return;
    }

    // テーブル作成
    await queryRunner.query(`
      CREATE TABLE email_templates (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        subject VARCHAR NOT NULL,
        body TEXT NOT NULL,
        type VARCHAR CHECK(type IN ('interview_invitation', 'offer', 'rejection', 'general')) NOT NULL DEFAULT 'general',
        variables TEXT NOT NULL,
        companyId VARCHAR,
        isActive BOOLEAN NOT NULL DEFAULT 1,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 初期データ投入
    await queryRunner.query(`
      INSERT INTO email_templates (id, name, subject, body, type, variables, isActive)
      VALUES 
        ('template1', '一次面接案内', '【{{company}}】一次面接のご案内', '{{candidate_name}} 様\n\nこの度は{{company}}にご応募いただき、誠にありがとうございます。\n\n一次面接の日程について、ご案内させていただきます。\n\n日時：{{interview_date}} {{interview_time}}\n場所：{{interview_location}}\n面接官：{{interviewer}}\n\n{{additional_info}}\n\nご都合が合わない場合は、お手数ですが別の日程をご提案ください。\n\nよろしくお願いいたします。\n\n{{sender_name}}\n{{company}}', 'interview_invitation', 'company,candidate_name,interview_date,interview_time,interview_location,interviewer,additional_info,sender_name', 1),
        ('template2', '内定通知', '【{{company}}】内定のご案内', '{{candidate_name}} 様\n\nこの度は{{company}}の採用選考にご参加いただき、誠にありがとうございます。\n\n厳正なる選考の結果、{{role}}職として内定を差し上げたく、ご連絡させていただきました。\n\n詳細な条件等につきましては、改めてご案内させていただきます。\n\n何かご不明な点がございましたら、お気軽にご連絡ください。\n\n{{sender_name}}\n{{company}}', 'offer', 'company,candidate_name,role,sender_name', 1)
    `);

    console.log('Created email_templates table and inserted initial data');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await connection.close();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 