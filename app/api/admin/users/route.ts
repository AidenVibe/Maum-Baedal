import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const adminSecret = request.headers.get('X-Admin-Secret')
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ 
        error: '관리자 권한이 필요합니다' 
      }, { status: 403 })
    }

    console.log('[ADMIN USERS] 사용자 목록 조회 시작')

    // 사용자 목록 조회 (기본 정보만)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
        email: true,
        name: true,
        createdAt: true,
        onboardedAt: true,
        kakaoSub: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`[ADMIN USERS] 사용자 ${users.length}명 조회 완료`)

    return NextResponse.json(users)
  } catch (error) {
    console.error('[ADMIN USERS] 에러:', error)
    return NextResponse.json({ 
      error: '사용자 목록 조회 중 오류가 발생했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 })
  }
}