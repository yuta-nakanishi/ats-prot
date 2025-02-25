import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ token: string }> {
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
}