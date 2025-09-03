/**
 * POST /api/share/[assignmentId]/answer - 공유받은 Assignment 답변 제출 API
 * 
 * 핵심 기능:
 * - 공유받은 사용자가 솔로 Assignment에 답변 제출
 * - 솔로모드→동반자모드 자동 전환
 * - 즉시 게이트 공개 및 대화 시작
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { submitAnswer } from '@/lib/queries'
import { z } from 'zod'

// 요청 바디 검증 스키마
const ShareAnswerSchema = z.object({
  content: z.string()
    .min(1, '답변 내용을 입력해주세요.')
    .max(1000, '답변은 1000자를 넘을 수 없습니다.')
    .trim()
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    // 1. 인증 확인
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    const { assignmentId } = await params
    console.log('✅ 공유 Assignment 답변 제출:', { userId, assignmentId })

    // 2. 요청 바디 파싱 및 검증
    const body = await request.json()
    const parseResult = ShareAnswerSchema.safeParse(body)
    
    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues[0]?.message || '잘못된 요청입니다.'
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    const { content } = parseResult.data

    // 3. 공유 Assignment 답변 제출 (솔로모드→동반자모드 전환)
    const result = await submitAnswer(assignmentId, userId, content, true)

    // 4. 전환 성공 확인
    if (!result.modeTransition) {
      return NextResponse.json(
        { error: '모드 전환이 정상적으로 처리되지 않았습니다.' },
        { status: 500 }
      )
    }

    // 5. 성공 응답
    const responseData = {
      success: true,
      gateStatus: result.gateStatus,
      conversationId: result.conversationId,
      companionId: result.companionId,
      modeTransition: result.modeTransition,
      message: '🎉 축하합니다! 동반자가 되어 함께 대화가 시작되었습니다!',
      // 클라이언트에서 리다이렉트할 수 있도록 URL 정보 제공
      redirectUrl: result.conversationId ? `/conversation/${result.conversationId}` : '/today'
    }

    return NextResponse.json(responseData, { status: 200 })

  } catch (error) {
    console.error('Share answer submission error:', error)
    
    // 에러 타입에 따른 적절한 응답
    if (error instanceof Error) {
      // 비즈니스 로직 에러들
      if (error.message.includes('솔로모드 Assignment가 아닙니다')) {
        return NextResponse.json(
          { error: '공유할 수 없는 질문입니다.' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('원래 사용자가 아직 답변하지 않았습니다')) {
        return NextResponse.json(
          { error: '질문 작성자가 아직 답변하지 않았습니다.' },
          { status: 400 }
        )
      }

      if (error.message.includes('과제를 찾을 수 없습니다')) {
        return NextResponse.json(
          { error: '존재하지 않는 질문입니다.' },
          { status: 404 }
        )
      }
      
      if (error.message.includes('권한이 없습니다')) {
        return NextResponse.json(
          { error: '이 질문에 답변할 권한이 없습니다.' },
          { status: 403 }
        )
      }
      
      if (error.message.includes('완료되었거나 만료된')) {
        return NextResponse.json(
          { error: '이미 완료되었거나 만료된 질문입니다.' },
          { status: 400 }
        )
      }
      
      // 일반적인 에러 메시지 반환
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: '답변 제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}

// OPTIONS 요청 처리 (CORS)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200 })
}