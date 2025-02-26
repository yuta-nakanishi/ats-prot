import { Controller, Post, Body, Get, UseGuards, Param, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { InviteUserDto } from './dto/invite-user.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'ユーザー登録' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'ログイン' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'ログアウト' })
  logout() {
    return { success: true };
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