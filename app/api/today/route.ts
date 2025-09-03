/**
 * GET /api/today - 오늘의 Assignment 조회/생성 API
 * 
 * 핵심 기능:
 * - 현재 서비스 데이의 Assignment 조회 또는 생성
 * - 게이트 상태 계산 및 반환
 * - 시간 계산 (서비스 데이 종료까지)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getOrCreateTodayAssignment, calculateGateStatus, isSoloAssignment } from '@/lib/queries'
import { getTimeLeftInServiceDay, formatTimeLeft, getServiceDay } from '@/lib/service-day'
import { isTestMode, getMockTodayData } from '@/lib/test-mode'
import { ensureQuestionsAvailable, quickCheckQuestionsAvailable } from '@/lib/questions-recovery'

export async function GET(request: NextRequest) {
  try {
    // 테스트 모드 지원
    if (isTestMode(request)) {
      console.log('✅ Test mode: returning mock today data')
      const mockData = getMockTodayData()
      return NextResponse.json(mockData)
    }

    // 1. 인증 확인
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    console.log('✅ Authenticated user:', userId)

    // 2. Questions 테이블 상태 확인 및 필요시 자동 복구
    console.log('🔍 Questions 테이블 상태 검증 중...')
    const questionsStatus = await ensureQuestionsAvailable()
    
    if (!questionsStatus.success) {
      console.error('❌ Questions 자동 복구 실패:', {
        error: questionsStatus.error,
        questionsCount: questionsStatus.questionsCount
      })
      
      return NextResponse.json(
        { 
          error: '현재 사용할 수 있는 질문이 없습니다. 관리자에게 문의해주세요.',
          details: process.env.NODE_ENV === 'development' ? questionsStatus.error : undefined
        },
        { status: 503 } // Service Unavailable
      )
    }

    if (questionsStatus.recovered) {
      console.log('✅ Questions 자동 복구 완료:', {
        questionsCount: questionsStatus.questionsCount,
        recovered: questionsStatus.recovered
      })
    } else {
      console.log('✅ Questions 테이블 정상:', {
        questionsCount: questionsStatus.questionsCount
      })
    }

    // 3. 오늘의 Assignment 조회/생성 (Solo mode 포함)
    const assignment = await getOrCreateTodayAssignment(userId)
    
    if (!assignment) {
      return NextResponse.json(
        { error: '과제를 생성할 수 없습니다.' },
        { status: 500 }
      )
    }

    // 4. Solo mode 확인
    const soloMode = isSoloAssignment(assignment)
    console.log('✅ Assignment mode:', soloMode ? 'SOLO' : 'COMPANION', assignment.companionId)

    // 5. 게이트 상태 계산
    const gateStatus = calculateGateStatus(assignment, userId)
    
    // 6. 내 답변과 상대방 답변 찾기
    const myAnswer = assignment.answers.find(a => a.userId === userId)
    const partnerAnswer = assignment.answers.find(a => a.userId !== userId)
    
    // 7. 상대방 정보 찾기 (Solo mode에서는 없음, 모드 전환된 경우 처리)
    let partner = null
    if (!soloMode) {
      const isUser1 = assignment.companion.user1Id === userId
      partner = isUser1 ? assignment.companion.user2 : assignment.companion.user1
      
      // 모드 전환되었지만 아직 soloMode가 true로 남아있는 경우 처리
      if (!partner && assignment.companion.status === 'active') {
        // Assignment가 일반 Companion으로 변경되었는데 soloMode가 잘못 계산된 경우
        const refreshedAssignment = await getOrCreateTodayAssignment(userId)
        if (refreshedAssignment && !isSoloAssignment(refreshedAssignment)) {
          const refreshedIsUser1 = refreshedAssignment.companion.user1Id === userId
          partner = refreshedIsUser1 ? refreshedAssignment.companion.user2 : refreshedAssignment.companion.user1
        }
      }
    }
    
    // 8. 시간 계산
    const timeLeft = getTimeLeftInServiceDay()
    const timeLeftText = formatTimeLeft(timeLeft.hours, timeLeft.minutes)
    
    // 9. 응답 데이터 구성 (Solo mode 지원)
    const baseUrl = process.env.NEXTAUTH_URL || 'https://dearq.app'
    const shareUrl = soloMode && myAnswer ? `${baseUrl}/share/${assignment.id}` : undefined
    
    const responseData = {
      // Assignment 기본 정보
      assignmentId: assignment.id,
      serviceDay: assignment.serviceDay,
      
      // 질문 정보
      question: assignment.question.content,
      questionId: assignment.question.id,
      questionCategory: assignment.question.category,
      
      // 답변 정보
      myAnswer: myAnswer?.content || '',
      myAnswerId: myAnswer?.id,
      partnerAnswer: gateStatus === 'opened' ? partnerAnswer?.content : undefined,
      
      // 게이트 상태
      gateStatus,
      conversationId: assignment.conversation?.id,
      
      // Solo mode 관련
      soloMode,
      shareUrl,
      canShare: true, // 질문 확인 즉시 공유 가능
      
      // 시간 정보
      timeLeft: timeLeftText,
      timeLeftMinutes: timeLeft.totalMinutes,
      isExpired: timeLeft.isExpired,
      
      // 상대방 정보 (Solo mode에서는 선택적)
      partnerName: partner?.nickname || partner?.label || '가족',
      partnerLabel: partner?.label,
      
      // 기능 제한 정보
      canAnswer: !timeLeft.isExpired && assignment.status === 'active'
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Today API error:', error)
    
    // 에러 타입별 적절한 사용자 메시지 반환
    const errorMessage = getErrorMessage(error)
    const statusCode = getErrorStatusCode(error)
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}

// 에러 메시지 추출 함수
function getErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }
  
  // Solo mode 지원으로 이 에러는 더 이상 발생하지 않아야 함
  if (error.message.includes('동반자이 없습니다')) {
    console.warn('Unexpected error: 동반자이 없는 사용자를 위한 Solo mode가 작동하지 않음')
    return 'Solo mode 처리 중 오류가 발생했습니다.'
  }
  
  if (error.message.includes('질문이 없습니다') || error.message.includes('사용 가능한 질문이 없습니다')) {
    return '현재 사용할 수 있는 질문이 없습니다. 잠시 후 다시 시도해주세요.'
  }
  
  return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
}

// 에러 상태 코드 추출 함수
function getErrorStatusCode(error: unknown): number {
  if (error instanceof Error && error.message.includes('동반자이 없습니다')) {
    return 500 // 내부 서버 오류
  }
  return 500 // 기본 서버 오류
}
