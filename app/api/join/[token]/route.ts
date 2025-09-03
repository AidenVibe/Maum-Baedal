import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateShareToken, useShareToken } from '@/lib/share-token'

/**
 * 토큰 검증 API
 * GET /api/join/[token]
 * 
 * 토큰 유효성 검사 및 초대자 정보 반환
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json({
        error: '토큰이 제공되지 않았습니다'
      }, { status: 400 })
    }

    // 토큰 유효성 검사
    const validation = await validateShareToken(token)

    if (!validation.isValid) {
      return NextResponse.json({
        error: validation.error || '유효하지 않은 토큰입니다'
      }, { status: 400 })
    }

    const { shareToken } = validation

    return NextResponse.json({
      success: true,
      token: token,  // URL에서 가져온 token 파라미터 사용
      creator: {
        id: shareToken!.creator.id,
        nickname: shareToken!.creator.nickname,
        bio: shareToken!.creator.bio
      },
      message: shareToken!.message,
      expiresAt: shareToken!.expiresAt
    })

  } catch (error) {
    console.error('[JOIN API] 토큰 검증 실패:', error)
    return NextResponse.json({
      error: '토큰 검증 중 오류가 발생했습니다'
    }, { status: 500 })
  }
}

/**
 * 페어 생성 API
 * POST /api/join/[token]
 * 
 * 토큰으로 페어 생성 및 자동 연결
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // 1. 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({
        error: '로그인이 필요합니다'
      }, { status: 401 })
    }

    // 2. 토큰 유효성 검사
    const validation = await validateShareToken(token)
    if (!validation.isValid) {
      return NextResponse.json({
        error: validation.error || '유효하지 않은 토큰입니다'
      }, { status: 400 })
    }

    const { shareToken } = validation

    // 3. 자기 자신의 토큰인지 확인
    if (shareToken!.creatorId === session.user.id) {
      return NextResponse.json({
        error: '자신이 생성한 초대 링크는 사용할 수 없습니다'
      }, { status: 400 })
    }

    // 4. 사용자 온보딩 상태 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        nickname: true,
        interests: true,
        onboardedAt: true
      }
    })

    if (!user) {
      return NextResponse.json({
        error: '사용자를 찾을 수 없습니다'
      }, { status: 404 })
    }

    if (!user.onboardedAt || !user.nickname || !user.interests?.length) {
      return NextResponse.json({
        error: '먼저 온보딩을 완료해 주세요'
      }, { status: 400 })
    }

    // 5. 이미 페어가 있는지 확인
    const existingPair = await prisma.companion.findFirst({
      where: {
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id }
        ],
        status: 'active'
      }
    })

    if (existingPair) {
      return NextResponse.json({
        error: '이미 다른 가족과 연결되어 있습니다'
      }, { status: 400 })
    }

    // 6. 초대자도 페어가 없는지 확인
    const creatorPair = await prisma.companion.findFirst({
      where: {
        OR: [
          { user1Id: shareToken!.creatorId },
          { user2Id: shareToken!.creatorId }
        ],
        status: 'active'
      }
    })

    if (creatorPair) {
      return NextResponse.json({
        error: '초대한 가족이 이미 다른 사람과 연결되어 있습니다'
      }, { status: 400 })
    }

    // 7. 트랜잭션으로 페어 생성 및 토큰 사용 처리
    const result = await prisma.$transaction(async (tx) => {
      // 페어 생성
      const newPair = await tx.companion.create({
        data: {
          user1Id: shareToken!.creatorId,  // 초대한 사람
          user2Id: session.user.id,        // 초대받은 사람
          status: 'active',
          connectedAt: new Date()
        },
        include: {
          user1: {
            select: { id: true, nickname: true }
          },
          user2: {
            select: { id: true, nickname: true }
          }
        }
      })

      // 토큰 사용 처리
      await tx.shareToken.update({
        where: { token },
        data: {
          status: 'used',
          usedAt: new Date(),
          companionId: newPair.id
        }
      })

      return newPair
    })

    console.log('[JOIN API] 페어링 완료:', {
      companionId: result.id,
      creator: result.user1.nickname,
      joiner: result.user2?.nickname || '알 수 없음'
    })

    if (!result.user2) {
      return NextResponse.json({
        error: '페어링에 실패했습니다. user2 정보가 없습니다.'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      companionId: result.id,
      creator: {
        id: result.user1.id,
        nickname: result.user1.nickname
      },
      joiner: {
        id: result.user2.id,
        nickname: result.user2.nickname
      },
      connectedAt: result.connectedAt
    })

  } catch (error) {
    console.error('[JOIN API] 페어링 실패:', error)
    return NextResponse.json({
      error: '가족 연결 중 오류가 발생했습니다'
    }, { status: 500 })
  }
}