import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ token: string }> {
    try {
      const existingUser = await this.usersRepository.findOne({
        where: { email: registerDto.email }
      });

      if (existingUser) {
        throw new ConflictException('このメールアドレスは既に登録されています');
      }

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const user = this.usersRepository.create({
        ...registerDto,
        password: hashedPassword
      });

      await this.usersRepository.save(user);

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return { token };
    } catch (error) {
      this.logger.error(`ユーザー登録エラー: ${error.message}`, error.stack);
      
      // 既に処理されている特定のエラーは再スローする
      if (error instanceof ConflictException) {
        throw error;
      }
      
      // その他のエラーは内部サーバーエラーとして処理
      throw new InternalServerErrorException(`ユーザー登録中に問題が発生しました: ${error.message}`);
    }
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email }
    });

    if (!user) {
      throw new UnauthorizedException('メールアドレスまたはパスワードが正しくありません');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('メールアドレスまたはパスワードが正しくありません');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return { token };
  }

  async validateUser(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      return this.usersRepository.findOne({ where: { id: decoded.userId } });
    } catch {
      return null;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.usersRepository.find({
        relations: ['company', 'department', 'team']
      });
    } catch (error) {
      this.logger.error(`ユーザー一覧取得エラー: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`ユーザー一覧の取得中に問題が発生しました: ${error.message}`);
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id },
        relations: ['company', 'department', 'team']
      });
      
      if (!user) {
        throw new UnauthorizedException('ユーザーが見つかりません');
      }
      
      return user;
    } catch (error) {
      this.logger.error(`ユーザー取得エラー: ${error.message}`, error.stack);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new InternalServerErrorException(`ユーザーの取得中に問題が発生しました: ${error.message}`);
    }
  }

  async inviteUser(inviteUserDto: InviteUserDto, currentUser: User): Promise<{ invitationToken: string }> {
    try {
      // ユーザーが他のユーザーを招待できる権限があるか確認
      if (!currentUser.isCompanyAdmin && !currentUser.isSuperAdmin) {
        throw new ForbiddenException('ユーザーを招待する権限がありません');
      }

      // メールアドレスが既に使用されているか確認
      const existingUser = await this.usersRepository.findOne({
        where: { email: inviteUserDto.email }
      });

      if (existingUser) {
        throw new ConflictException('このメールアドレスは既に登録されています');
      }

      // 仮パスワードを生成
      const tempPassword = uuidv4();
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // 新しいユーザーを作成
      const newUser = this.usersRepository.create({
        email: inviteUserDto.email,
        name: inviteUserDto.name,
        password: hashedPassword,
        companyId: currentUser.companyId,
        departmentId: inviteUserDto.departmentId,
        teamId: inviteUserDto.teamId,
        jobTitle: inviteUserDto.jobTitle,
        role: inviteUserDto.role || UserRole.RECRUITER,
        isCompanyAdmin: inviteUserDto.isCompanyAdmin || false,
        isActive: false, // パスワード設定するまで非アクティブ
      });

      await this.usersRepository.save(newUser);

      // 招待トークンを生成
      const invitationToken = jwt.sign(
        { userId: newUser.id, email: newUser.email, purpose: 'invitation' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // 実際のアプリケーションでは、ここでメール送信処理を行う
      // メール内に招待リンクを含める: https://yourapp.com/set-password?token=invitationToken

      return { invitationToken };
    } catch (error) {
      this.logger.error(`ユーザー招待エラー: ${error.message}`, error.stack);
      
      if (error instanceof ConflictException || error instanceof ForbiddenException) {
        throw error;
      }
      
      throw new InternalServerErrorException(`ユーザー招待中に問題が発生しました: ${error.message}`);
    }
  }

  async setPassword(setPasswordDto: SetPasswordDto): Promise<{ token: string }> {
    try {
      // トークンを検証
      const decoded = jwt.verify(
        setPasswordDto.token,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as any;

      if (!decoded || decoded.purpose !== 'invitation') {
        throw new UnauthorizedException('無効なトークンです');
      }

      // ユーザーを取得
      const user = await this.usersRepository.findOne({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new NotFoundException('ユーザーが見つかりません');
      }

      // パスワードをハッシュ化して保存
      const hashedPassword = await bcrypt.hash(setPasswordDto.password, 10);
      user.password = hashedPassword;
      user.isActive = true; // アカウントをアクティブ化

      await this.usersRepository.save(user);

      // 通常のログイントークンを生成
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return { token };
    } catch (error) {
      this.logger.error(`パスワード設定エラー: ${error.message}`, error.stack);
      
      if (error instanceof UnauthorizedException || error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException(`パスワード設定中に問題が発生しました: ${error.message}`);
    }
  }
}