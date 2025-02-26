import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';

async function createSuperAdmin() {
  // コマンドライン引数の解析
  const args = process.argv.slice(2);
  let email = '';
  let password = '';
  let name = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--email=')) {
      email = args[i].split('=')[1];
    } else if (args[i].startsWith('--password=')) {
      password = args[i].split('=')[1];
    } else if (args[i].startsWith('--name=')) {
      name = args[i].split('=')[1];
    }
  }

  // 必須パラメータのチェック
  if (!email || !password || !name) {
    console.error('必須パラメータが不足しています。');
    console.error('使用方法: npm run create-super-admin -- --email=admin@example.com --password=yourpassword --name="管理者名"');
    process.exit(1);
  }

  try {
    // NestJSアプリケーションを作成
    const app = await NestFactory.create(AppModule);
    const authService = app.get(AuthService);

    // スーパー管理者を作成
    const result = await authService.register({
      email,
      password,
      name,
      isSuperAdmin: true
    });

    console.log('✅ プラットフォーム管理者が正常に作成されました:');
    console.log(`   メール: ${email}`);
    console.log(`   名前: ${name}`);
    console.log('\nログイン情報を使用して http://localhost:3000 からシステムにアクセスできます。');

    await app.close();
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

createSuperAdmin(); 