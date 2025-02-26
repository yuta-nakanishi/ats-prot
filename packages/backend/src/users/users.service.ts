import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  /**
   * 全ユーザーを取得
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['company', 'department', 'team'],
    });
  }

  /**
   * IDでユーザーを検索
   */
  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['company', 'department', 'team'],
    });

    if (!user) {
      throw new NotFoundException(`ユーザーID ${id} が見つかりません`);
    }

    return user;
  }

  /**
   * メールアドレスでユーザーを検索
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['company', 'department', 'team'],
    });
  }

  /**
   * 企業に所属するユーザー一覧を取得
   */
  async findByCompany(companyId: string): Promise<User[]> {
    // 企業の存在確認
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`企業ID ${companyId} が見つかりません`);
    }

    return this.usersRepository.find({
      where: { companyId },
      relations: ['department', 'team'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * 新規ユーザー作成
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // 企業の存在確認
    const company = await this.companiesRepository.findOne({
      where: { id: createUserDto.companyId },
    });

    if (!company) {
      throw new NotFoundException(`企業ID ${createUserDto.companyId} が見つかりません`);
    }

    // メールアドレスの重複チェック
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException(`メールアドレス ${createUserDto.email} は既に使用されています`);
    }

    // パスワードが指定されていない場合は自動生成
    const password = createUserDto.password || this.generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザー作成
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(newUser);

    // パスワードを除外したユーザー情報を返す
    const { password: _, ...result } = savedUser;
    
    // 一時パスワードを追加したオブジェクトを作成して返す
    return {
      ...result,
      // 自動生成パスワードの場合のみ、一時的に返す（本番環境では安全な方法で通知するべき）
      temporaryPassword: createUserDto.password ? undefined : password,
    } as unknown as User;
  }

  /**
   * ユーザー情報更新
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // ユーザー情報を更新
    Object.assign(user, updateUserDto);

    // 保存して返す
    return this.usersRepository.save(user);
  }

  /**
   * ユーザー削除
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  /**
   * ユーザーのパスワード変更
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'], // パスワードフィールドも選択
    });

    if (!user) {
      throw new NotFoundException(`ユーザーID ${userId} が見つかりません`);
    }

    // 現在のパスワードを確認
    const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('現在のパスワードが正しくありません');
    }

    // 新しいパスワードをハッシュ化して保存
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedPassword;

    await this.usersRepository.save(user);
  }

  /**
   * パスワードをリセット（管理者用）
   */
  async resetPassword(userId: string): Promise<string> {
    const user = await this.findOne(userId);

    // 新しいランダムパスワードを生成
    const newPassword = this.generatePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // パスワード更新
    user.password = hashedPassword;
    await this.usersRepository.save(user);

    // 生成したパスワードを返す（本番環境では安全な方法で通知するべき）
    return newPassword;
  }

  /**
   * ユーザーを無効化（ソフト削除）
   */
  async deactivate(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = false;
    return this.usersRepository.save(user);
  }

  /**
   * ユーザーを再有効化
   */
  async activate(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = true;
    return this.usersRepository.save(user);
  }

  /**
   * ランダムなパスワードを生成（仮実装）
   */
  private generatePassword(length = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
} 