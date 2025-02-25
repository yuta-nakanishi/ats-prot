import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isAuthPage = request.nextUrl.pathname === '/login';
  const isRegisterPage = request.nextUrl.pathname === '/register';
  const isTestPage = request.nextUrl.pathname === '/test';
  const isPublicPage = isAuthPage || isRegisterPage || isTestPage;
  
  // デバッグログ（環境変数がtrueの場合のみ出力）
  if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
    console.log('Middleware running for path:', request.nextUrl.pathname);
    console.log('Token exists:', !!token);
    console.log('Is public page:', isPublicPage);
  }
  
  // 未認証状態でパブリックページ以外にアクセスした場合はログインページにリダイレクト
  if (!token && !isPublicPage) {
    if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
      console.log('Redirecting to login because no token and not public page');
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 認証済み状態でログインページにアクセスした場合はダッシュボードにリダイレクト
  if (token && isAuthPage) {
    if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
      console.log('Redirecting to dashboard because has token and is auth page');
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// 静的アセットとAPIルートにはミドルウェアを適用しない
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 