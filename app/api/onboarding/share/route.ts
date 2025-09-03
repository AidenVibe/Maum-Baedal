import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createShareToken } from '@/lib/share-token'

/**
 * 공유 토큰 생성 API
 * POST /api/onboarding/share
 * 
 * Body:
 * - message?: string (선택, 사용자 정의 초대 메시지)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: '로그인이 필요합니다' 
      }, { status: 401 })
    }

    // 2. 요청 데이터 파싱
    const body = await request.json()
    const { message } = body

    // 3. 메시지 검증 (선택사항)
    if (message && (typeof message !== 'string' || message.length > 200)) {
      return NextResponse.json({ 
        error: '초대 메시지는 200글자 이하로 입력해 주세요' 
      }, { status: 400 })
    }

    // 4. 사용자가 온보딩을 완료했는지 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        nickname: true,
        onboardedAt: true,
        interests: true
      }
    })

    if (!user) {
      return NextResponse.json({ 
        error: '사용자를 찾을 수 없습니다' 
      }, { status: 404 })
    }

    if (!user.onboardedAt || !user.nickname || !user.interests?.length) {
      return NextResponse.json({ 
        error: '먼저 프로필과 관심사 설정을 완료해 주세요' 
      }, { status: 400 })
    }

    // 5. 기존 미사용 토큰 확인 (하나만 유지)
    const existingToken = await prisma.shareToken.findFirst({
      where: {
        creatorId: session.user.id,
        status: 'pending',
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 기존 토큰이 있으면 재사용 (중복 생성 방지)
    if (existingToken) {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const shareUrl = `${baseUrl}/join/${existingToken.token}`

      return NextResponse.json({
        success: true,
        token: existingToken.token,
        shareUrl,
        expiresAt: existingToken.expiresAt,
        message: '기존 초대 링크를 사용합니다'
      })
    }

    // 6. 새 공유 토큰 생성
    const shareData = await createShareToken(session.user.id, message)

    console.log('[SHARE API] 토큰 생성 완료:', {
      userId: session.user.id,
      nickname: user.nickname,
      hasMessage: !!message
    })

    return NextResponse.json({
      success: true,
      token: shareData.token,
      shareUrl: shareData.shareUrl,
      expiresAt: shareData.expiresAt
    })

  } catch (error) {
    console.error('[SHARE API] 토큰 생성 실패:', error)
    return NextResponse.json({ 
      error: '초대 링크 생성 중 오류가 발생했습니다' 
    }, { status: 500 })
  }
}