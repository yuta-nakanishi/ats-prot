import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request) || this.extractTokenFromCookie(request);
    
    if (!token) {
      throw new UnauthorizedException('認証トークンが提供されていません');
    }
    
    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
      const payload = verify(token, secret);
      
      // リクエストにユーザー情報を設定
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('無効な認証トークンです');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractTokenFromCookie(request: any): string | undefined {
    if (request.cookies && request.cookies.token) {
      return request.cookies.token;
    }
    return undefined;
  }
} 