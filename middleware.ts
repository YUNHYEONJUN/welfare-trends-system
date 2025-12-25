import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth-middleware';

// 인증이 필요 없는 공개 경로
const publicPaths = [
  '/', // 홈페이지 공개
  '/auth/login',
  '/auth/signup',
  '/_next', // Next.js 내부 파일
  '/favicon.ico',
  '/api/auth', // 인증 API
];

// 정적 파일 경로
const staticPaths = [
  '/images',
  '/fonts',
  '/css',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 공개 경로 확인
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  const isStaticPath = staticPaths.some(path => pathname.startsWith(path));

  if (isPublicPath || isStaticPath) {
    return NextResponse.next();
  }

  // JWT 토큰 검증
  const user = verifyToken(request);

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!user) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 관리자 페이지 접근 권한 확인
  if (pathname.startsWith('/admin') && user.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 승인된 사용자만 접근 가능
  if (user.status !== 'approved') {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('error', 'account_pending');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 경로에 적용:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
