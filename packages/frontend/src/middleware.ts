import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isAuthPage = request.nextUrl.pathname === '/login';
  const isRegisterPage = request.nextUrl.pathname === '/register';
  const isTestPage = request.nextUrl.pathname === '/test';
  const isLogoutPage = request.nextUrl.pathname === '/logout';
  // 強制ログアウトページは認証チェックをスキップするパブリックページとして扱う
  const isPublicPage = isAuthPage || isRegisterPage || isTestPage || isLogoutPage;
  
  // URLのクエリパラメータをチェック
  const isLogoutProcess = request.nextUrl.searchParams.get('logout') === 'true';
  const isForceLogout = request.nextUrl.searchParams.get('force') === 'true';
  
  // デバッグログ（常に出力）
  console.log('[Middleware] Path:', request.nextUrl.pathname);
  console.log('[Middleware] Token exists:', !!token);
  console.log('[Middleware] Is logout process:', isLogoutProcess);
  console.log('[Middleware] Is force logout:', isForceLogout);
  
  // 強制ログアウトページへのアクセスは常に許可
  if (isLogoutPage) {
    console.log('[Middleware] Allowing access to force logout page');
    return NextResponse.next();
  }
  
  // 強制ログアウト後のログインページアクセスの場合、Cookieを削除
  if (isForceLogout && isAuthPage) {
    console.log('[Middleware] Handling force logout');
    // ログアウトクエリパラメータを削除したURLを作成
    const cleanUrl = new URL('/login', request.url);
    
    // レスポンスを作成してCookieを削除
    const response = NextResponse.rewrite(cleanUrl);
    if (token) {
      response.cookies.delete('token');
    }
    
    return response;
  }
  
  // 通常のログアウト処理中の場合
  if (isLogoutProcess && isAuthPage) {
    console.log('[Middleware] Handling logout process');
    // ログアウトクエリパラメータを削除したURLを作成
    const cleanUrl = new URL('/login', request.url);
    
    // レスポンスを作成してCookieを削除
    const response = NextResponse.rewrite(cleanUrl);
    if (token) {
      response.cookies.delete('token');
    }
    
    return response;
  }
  
  // 未認証状態でパブリックページ以外にアクセスした場合はログインページにリダイレクト
  if (!token && !isPublicPage) {
    console.log('[Middleware] Redirecting to login: no token, not public page');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 認証済み状態でログインページにアクセスした場合はダッシュボードにリダイレクト
  // ただし、ログアウト処理中は除外
  if (token && isAuthPage && !isLogoutProcess && !isForceLogout) {
    console.log('[Middleware] Redirecting to dashboard: has token, on login page');
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