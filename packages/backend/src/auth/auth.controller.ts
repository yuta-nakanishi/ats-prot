import { Controller, Post, Body, Get, UseGuards, Param, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { InviteUserDto } from './dto/invite-user.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { Request, Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'ユーザー登録' })
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.register(registerDto);
    
    // Cookieにトークンを設定
    response.cookie('token', result.token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24時間
      sameSite: 'lax',
      path: '/',
    });
    
    return result;
  }

  @Post('login')
  @ApiOperation({ summary: 'ログイン' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(loginDto);
    
    // Cookieにトークンを設定
    response.cookie('token', result.token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24時間
      sameSite: 'lax',
      path: '/',
    });
    
    return result;
  }

  @Post('logout')
  @ApiOperation({ summary: 'ログアウト' })
  logout(@Res({ passthrough: true }) response: Response) {
    // Cookieからトークンを削除
    response.clearCookie('token', {
      httpOnly: true,
      path: '/',
    });
    
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'ログインユーザーの情報を取得' })
  @ApiResponse({ status: 200, description: 'ユーザー情報を取得しました' })
  async getCurrentUser(@Req() req: Request & { user: any }) {
    if (!req.user) {
      throw new UnauthorizedException('認証が必要です');
    }
    return this.authService.getUserById(req.user.userId);
  }

  @Post('invite')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '新しいユーザーを招待します' })
  @ApiResponse({ status: 201, description: '招待が正常に送信されました' })
  @ApiBody({ type: InviteUserDto })
  async inviteUser(@Body() inviteUserDto: InviteUserDto, @Req() req: Request & { user: any }) {
    if (!req.user) {
      throw new UnauthorizedException('認証が必要です');
    }
    return this.authService.inviteUser(inviteUserDto, req.user);
  }

  @Post('set-password')
  @ApiOperation({ summary: '招待されたユーザーがパスワードを設定します' })
  @ApiResponse({ status: 201, description: 'パスワードが正常に設定されました' })
  @ApiBody({ type: SetPasswordDto })
  async setPassword(@Body() setPasswordDto: SetPasswordDto) {
    return this.authService.setPassword(setPasswordDto);
  }
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'すべてのユーザーを取得' })
  getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '特定のユーザーを取得' })
  getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }
}