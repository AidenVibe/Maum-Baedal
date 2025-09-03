/**
 * POST /api/answer - 답변 제출 API
 * 
 * 핵심 기능:
 * - 답변 제출 또는 업데이트
 * - 게이트 상태 자동 확인 및 Conversation 생성
 * - 2개 답변 완료 시 자동 게이트 공개
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { submitAnswer } from '@/lib/queries'
import { z } from 'zod'

// 요청 바디 검증 스키마
const SubmitAnswerSchema = z.object({
  assignmentId: z.string().min(1, '과제 ID가 필요합니다.'),
  content: z.string()
    .min(1, '답변 내용을 입력해주세요.')
    .max(1000, '답변은 1000자를 넘을 수 없습니다.')
    .trim(),
  isSharedAssignment: z.boolean().optional() // 공유받은 Assignment인지 여부
})

export async function POST(request: NextRequest) {
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
    console.log('✅ Submit answer by authenticated user:', userId)

    // 2. 요청 바디 파싱 및 검증
    const body = await request.json()
    const parseResult = SubmitAnswerSchema.safeParse(body)
    
    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues[0]?.message || '잘못된 요청입니다.'
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    const { assignmentId, content, isSharedAssignment } = parseResult.data

    // 3. 답변 제출 처리 (솔로모드→동반자모드 전환 지원)
    const result = await submitAnswer(assignmentId, userId, content, isSharedAssignment)

    // 3.5. 게이트 공개 시 알림 발송
    if (result.gateStatus === 'opened') {
      try {
        // 게이트 공개 알림 비동기 발송 (에러가 발생해도 답변 제출은 성공 처리)
        const { sendGateOpenedNotification } = await import('@/lib/notification-service')
        await sendGateOpenedNotification(assignmentId)
        console.log('✅ 게이트 공개 알림 발송 완료:', assignmentId)
      } catch (notificationError) {
        // 알림 실패는 로깅만 하고 답변 제출은 성공 처리
        console.error('❌ 게이트 공개 알림 발송 실패:', notificationError)
      }
    }

    // 4. 성공 응답
    const responseData = {
      success: result.success,
      gateStatus: result.gateStatus,
      conversationId: result.conversationId,
      companionId: result.companionId, // 새로 생성된 Companion ID (모드 전환 시)
      modeTransition: result.modeTransition, // 모드 전환 여부
      isLastAnswerer: result.gateStatus === 'opened', // 게이트가 열렸다면 마지막 답변자
      message: getSuccessMessage(result.gateStatus, result.modeTransition)
    }

    return NextResponse.json(responseData, { status: 200 })

  } catch (error) {
    console.error('Answer submission error:', error)
    
    // 에러 타입에 따른 적절한 응답
    if (error instanceof Error) {
      // 비즈니스 로직 에러들
      if (error.message.includes('과제를 찾을 수 없습니다')) {
        return NextResponse.json(
          { error: '존재하지 않는 과제입니다.' },
          { status: 404 }
        )
      }
      
      if (error.message.includes('권한이 없습니다')) {
        return NextResponse.json(
          { error: '이 과제에 답변할 권한이 없습니다.' },
          { status: 403 }
        )
      }
      
      if (error.message.includes('완료되었거나 만료된')) {
        return NextResponse.json(
          { error: '이미 완료되었거나 만료된 과제입니다.' },
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

// 게이트 상태에 따른 성공 메시지 (모드 전환 지원)
function getSuccessMessage(gateStatus: string, modeTransition?: boolean): string {
  // 솔로모드→동반자모드 전환된 경우
  if (modeTransition && gateStatus === 'opened') {
    return '🎉 축하합니다! 동반자가 되어 함께 대화가 시작되었습니다!'
  }

  switch (gateStatus) {
    case 'waiting_partner':
      return '답변이 저장되었습니다. 상대방의 답변을 기다리고 있어요.'
    case 'opened':
      return '축하합니다! 두 분의 답변이 모두 완료되어 대화가 공개되었습니다.'
    case 'solo_mode':
      return '답변이 저장되었습니다. 질문을 공유해서 가족과 대화를 나눠보세요!'
    case 'need_my_answer':
      return '답변이 저장되었습니다.'
    default:
      return '답변이 성공적으로 저장되었습니다.'
  }
}

// OPTIONS 요청 처리 (CORS)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200 })
}