/**
 * POST /api/share - 질문 공유 토큰 생성 API
 * 
 * 기능:
 * - Solo 모드 사용자가 질문을 공유할 수 있는 토큰 생성
 * - 공유 링크로 접속한 사용자를 위한 임시 토큰 생성
 * - 토큰 유효성 검증 및 만료 관리
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { randomBytes } from 'crypto'
import { z } from 'zod'

// 공유 토큰 생성 요청 스키마
const ShareTokenSchema = z.object({
  assignmentId: z.string().min(1, '과제 ID가 필요합니다.'),
  message: z.string().max(200, '메시지는 200자를 초과할 수 없습니다.').optional(),
  type: z.enum(['question_invite']).default('question_invite')
})

// GET 요청: 공유 토큰으로 질문 정보 조회
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')
    
    if (!token) {
      return NextResponse.json(
        { error: '공유 토큰이 필요합니다.' },
        { status: 400 }
      )
    }

    // 토큰 유효성 검증
    const shareToken = await prisma.shareToken.findUnique({
      where: { token },
      include: {
        creator: {
          select: { 
            id: true, 
            nickname: true, 
            label: true 
          }
        }
      }
    })

    if (!shareToken) {
      return NextResponse.json(
        { error: '유효하지 않은 공유 링크입니다.' },
        { status: 404 }
      )
    }

    // 토큰 만료 확인
    if (shareToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: '만료된 공유 링크입니다.' },
        { status: 410 }
      )
    }

    // 이미 사용된 토큰 확인
    if (shareToken.status === 'used' || shareToken.companionId) {
      return NextResponse.json(
        { error: '이미 사용된 공유 링크입니다.' },
        { status: 410 }
      )
    }

    // 현재는 간단하게 토큰 정보만 반환 (필요시 추후 확장)
    return NextResponse.json({
      success: true,
      shareToken: {
        id: shareToken.id,
        token: shareToken.token,
        message: shareToken.message,
        expiresAt: shareToken.expiresAt,
        creator: shareToken.creator
      },
      // 간단한 메시지로 대체
      message: "공유 링크가 유효합니다. 마음배달에 참여해보세요!"
    })

  } catch (error) {
    console.error('Share token GET error:', error)
    return NextResponse.json(
      { error: '공유 링크 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST 요청: 새로운 공유 토큰 생성
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 요청 바디 검증
    const body = await request.json()
    const parseResult = ShareTokenSchema.safeParse(body)
    
    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues[0]?.message || '잘못된 요청입니다.'
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }
    
    const { assignmentId, message, type } = parseResult.data

    // Assignment 존재 확인 및 권한 체크
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        question: true,
        companion: true,
        answers: {
          where: { userId: session.user.id }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: '존재하지 않는 과제입니다.' },
        { status: 404 }
      )
    }

    // Solo 모드 확인 (solo-{userId} 형태의 companionId)
    const isSolo = assignment.companionId.startsWith('solo-')
    const expectedSoloPairId = `solo-${session.user.id}`
    
    if (isSolo && assignment.companionId !== expectedSoloPairId) {
      return NextResponse.json(
        { error: '이 과제에 대한 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 동반자 기반 Assignment의 경우 권한 확인
    if (!isSolo && assignment.companion &&
        assignment.companion.user1Id !== session.user.id && 
        assignment.companion.user2Id !== session.user.id) {
      return NextResponse.json(
        { error: '이 과제에 대한 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 내 답변 확인 (Solo 모드에서는 답변이 있어야 공유 가능)
    if (isSolo && (!assignment.answers || assignment.answers.length === 0)) {
      return NextResponse.json(
        { error: '답변을 작성한 후 공유할 수 있습니다.' },
        { status: 400 }
      )
    }

    // 32자 안전 토큰 생성
    const token = randomBytes(24).toString('base64url') // URL-safe Base64
    
    // 24시간 후 만료
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 1)

    // 공유 토큰 생성 (현재 스키마에 setupData 없으므로 기본 필드만 사용)
    const shareToken = await prisma.shareToken.create({
      data: {
        token,
        creatorId: session.user.id,
        message: message || null,
        status: 'pending',
        expiresAt
      }
    })

    console.log('✅ 공유 토큰 생성 완료:', {
      token: shareToken.token,
      creatorId: session.user.id,
      assignmentId,
      type: isSolo ? 'solo' : 'paired'
    })

    // 공유 URL 생성
    const baseUrl = process.env.NEXTAUTH_URL || 'https://dearq.app'
    const shareUrl = `${baseUrl}/join?token=${shareToken.token}`

    return NextResponse.json({
      success: true,
      shareToken: {
        id: shareToken.id,
        token: shareToken.token,
        shareUrl,
        message: shareToken.message,
        expiresAt: shareToken.expiresAt
      },
      questionData: {
        questionContent: assignment.question.content,
        questionCategory: assignment.question.category,
        serviceDay: assignment.serviceDay
      }
    })

  } catch (error) {
    console.error('Share token creation error:', error)
    return NextResponse.json(
      { error: '공유 링크 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}