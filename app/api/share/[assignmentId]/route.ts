/**
 * GET /api/share/[assignmentId] - 공유된 Assignment 조회 API
 * 
 * 핵심 기능:
 * - 솔로모드 Assignment 공유 링크를 통한 접근
 * - 공유받은 사람이 답변할 수 있도록 Assignment 정보 제공
 * - 이미 동반자가 있는 사용자는 접근 제한
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserCompanion, calculateGateStatus, isSoloAssignment } from '@/lib/queries'
import { getTimeLeftInServiceDay, formatTimeLeft } from '@/lib/service-day'

export async function GET(
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
    
    const currentUserId = session.user.id
    const { assignmentId } = await params

    // 2. Assignment 조회 (Solo Assignment만 공유 가능)
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        question: true,
        answers: {
          include: {
            user: { select: { id: true, nickname: true, label: true } }
          }
        },
        companion: {
          include: {
            user1: true,
            user2: true
          }
        },
        conversation: true
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: '존재하지 않는 질문입니다.' },
        { status: 404 }
      )
    }

    // 3. Solo Assignment인지 확인
    if (!isSoloAssignment(assignment)) {
      return NextResponse.json(
        { error: '공유할 수 없는 질문입니다.' },
        { status: 400 }
      )
    }

    // 4. Assignment가 활성 상태인지 확인
    if (assignment.status !== 'active') {
      return NextResponse.json(
        { error: '만료된 질문입니다.' },
        { status: 400 }
      )
    }

    // 5. 현재 사용자가 이미 동반자가 있는지 확인
    const currentUserCompanion = await getUserCompanion(currentUserId)
    if (currentUserCompanion) {
      return NextResponse.json(
        { error: '이미 동반자가 있어서 참여할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 6. Assignment의 원래 사용자 확인 (solo-{userId}에서 userId 추출)
    const originalUserId = assignment.companionId.replace('solo-', '')
    
    // 7. 현재 사용자가 원래 사용자와 동일한지 확인
    if (currentUserId === originalUserId) {
      return NextResponse.json(
        { error: '자신의 질문에는 답변할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 8. 원래 사용자의 답변 확인
    const originalUserAnswer = assignment.answers.find(a => a.userId === originalUserId)
    if (!originalUserAnswer) {
      return NextResponse.json(
        { error: '질문 작성자가 아직 답변하지 않았습니다.' },
        { status: 400 }
      )
    }

    // 9. 현재 사용자가 이미 답변했는지 확인
    const currentUserAnswer = assignment.answers.find(a => a.userId === currentUserId)
    
    // 10. 시간 확인
    const timeLeft = getTimeLeftInServiceDay()
    const timeLeftText = formatTimeLeft(timeLeft.hours, timeLeft.minutes)

    // 11. 원래 사용자 정보
    const originalUser = assignment.companion.user1

    // 12. 응답 데이터 구성
    const responseData = {
      // Assignment 기본 정보
      assignmentId: assignment.id,
      serviceDay: assignment.serviceDay,
      
      // 질문 정보
      question: assignment.question.content,
      questionCategory: assignment.question.category,
      
      // 원래 사용자 정보
      originalUser: {
        id: originalUser.id,
        nickname: originalUser.nickname || '익명',
        bio: originalUser.bio
      },
      
      // 답변 정보
      originalUserAnswer: originalUserAnswer.content,
      myAnswer: currentUserAnswer?.content || '',
      hasAnswered: !!currentUserAnswer,
      
      // 시간 정보
      timeLeft: timeLeftText,
      timeLeftMinutes: timeLeft.totalMinutes,
      isExpired: timeLeft.isExpired,
      
      // 기능 제한 정보
      canAnswer: !timeLeft.isExpired && !currentUserAnswer,
      
      // 모드 전환 관련
      willBecomeCompanion: true,
      companionshipMessage: `${originalUser.nickname || '익명'}님과 동반자가 되어 함께 대화를 나눠보세요!`
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Share assignment API error:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}