import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { isTestMode } from '@/lib/test-mode'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('[MIDDLEWARE] Path:', pathname)
  
  // NextAuth API 경로는 미들웨어에서 제외
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // API 라우트 테스트 모드 지원
  if (pathname.startsWith('/api/')) {
    if (process.env.NODE_ENV === 'development' && isTestMode(request)) {
      console.log('[MIDDLEWARE] API test mode bypass - allowing access:', pathname)
      return NextResponse.next()
    }
  }

  // Style guide 페이지는 개발 환경에서만 접근 가능
  if (pathname.startsWith('/style-guide')) {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Page not found' }, 
        { status: 404 }
      )
    }
  }

  // 관리자 페이지 인증 체크 (ADMIN_SECRET 기반)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminAuth = request.cookies.get('admin-auth')?.value
    const adminSecret = process.env.ADMIN_SECRET
    
    if (!adminAuth || !adminSecret || adminAuth !== adminSecret) {
      console.log('[MIDDLEWARE] Admin auth failed, redirecting to admin login')
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    console.log('[MIDDLEWARE] Admin auth success, allowing access')
    return NextResponse.next()
  }

  // 인증이 필요한 페이지들
  const protectedPaths = ['/today', '/history', '/settings', '/conversation']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  
  if (isProtectedPath) {
    try {
      // 개발 모드에서 테스트 관련 파라미터가 설정된 경우 인증 우회
      if (process.env.NODE_ENV === 'development') {
        const devScenarioHeader = request.headers.get('x-dev-scenario')
        const devScenarioQuery = request.nextUrl.searchParams.get('dev_scenario')
        const testModeQuery = request.nextUrl.searchParams.get('test_mode')
        
        if (devScenarioHeader || devScenarioQuery || testModeQuery === 'true') {
          console.log('[MIDDLEWARE] Test mode bypass - allowing access:', { devScenarioQuery, testModeQuery })
          return NextResponse.next()
        }
      }
      
      // 세션 토큰 직접 확인
      const sessionToken = request.cookies.get('next-auth.session-token')?.value
      console.log('[MIDDLEWARE] Session token exists:', sessionToken ? 'yes' : 'no')
      
      if (!sessionToken) {
        console.log('[MIDDLEWARE] No session token, redirecting to login')
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
      }
      
      // 토큰이 있으면 통과 (JWT 검증은 API 라우트에서 수행)
      console.log('[MIDDLEWARE] Session token found, allowing access')
      
    } catch (error) {
      console.error('[MIDDLEWARE] Token validation error:', error)
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 이미 로그인한 사용자가 로그인 페이지 접근시 /today로 리다이렉트
  if (pathname === '/login') {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value
    console.log('[MIDDLEWARE] Login page - session token exists:', sessionToken ? 'yes' : 'no')
    
    if (sessionToken) {
      console.log('[MIDDLEWARE] Session token exists on login page, redirecting to /today')
      const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '/today'
      return NextResponse.redirect(new URL(callbackUrl, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/style-guide/:path*',
    '/today/:path*',
    '/history/:path*', 
    '/settings/:path*',
    '/conversation/:path*',
    '/login',
    // API 라우트들 - 테스트 모드 지원용
    '/api/today',
    '/api/settings/:path*',
    '/api/onboarding/:path*'
  ]
}