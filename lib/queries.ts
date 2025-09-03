/**
 * 데이터베이스 쿼리 함수들 - 마음배달 v2 비즈니스 로직
 */

import { prisma } from './prisma'
import { getServiceDay } from './service-day'
import { getPersonalizedQuestion } from './personalized-questions'
import { quickCheckQuestionsAvailable } from './questions-recovery'
import type { AssignmentWithDetails, GateStatusType } from './types'
import type { Assignment, Question, Answer, Conversation, Companion, User } from '@prisma/client'

/**
 * 사용자의 동반자(Companion) 정보 조회
 */
export async function getUserCompanion(userId: string): Promise<Companion | null> {
  return await prisma.companion.findFirst({
    where: {
      OR: [
        { user1Id: userId },
        { user2Id: userId }
      ],
      status: 'active'
    },
    include: {
      user1: { select: { id: true, nickname: true, label: true } },
      user2: { select: { id: true, nickname: true, label: true } }
    }
  })
}

/**
 * Solo 사용자를 위한 가상 companionId 생성
 */
function getSoloCompanionId(userId: string): string {
  return `solo-${userId}`
}

/**
 * Solo Assignment 생성/조회 (동반자이 없는 사용자용)
 */
export async function getOrCreateSoloAssignment(userId: string): Promise<AssignmentWithDetails | null> {
  const serviceDay = getServiceDay()
  const soloCompanionId = getSoloCompanionId(userId)

  return await prisma.$transaction(async (tx) => {
    // 1. Solo Companion가 없다면 생성
    let soloCompanion = await tx.companion.findUnique({
      where: { id: soloCompanionId }
    })
    
    if (!soloCompanion) {
      // Solo 사용자를 위한 더미 Companion 생성 (user1 = user2 = 본인)
      soloCompanion = await tx.companion.create({
        data: {
          id: soloCompanionId,
          user1Id: userId,
          user2Id: userId,  // Solo mode에서는 자기 자신과 동반자
          status: 'solo'    // 특별한 상태로 구분
        }
      })
      
      console.log('✅ Solo Companion 생성 완료:', {
        companionId: soloCompanionId,
        userId
      })
    }
    
    // 2. 기존 Solo Assignment 확인
    let assignment = await tx.assignment.findFirst({
      where: {
        companionId: soloCompanionId,
        serviceDay,
        status: 'active'
      },
      include: {
        question: true,
        answers: {
          include: {
            user: { select: { nickname: true, label: true } }
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
      // 사용자 정보 조회 (관심사 기반 질문 추천용)
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { interests: true }
      })

      // Solo mode 전용 개인화된 질문 추천
      const userInterests = user?.interests || []
      let selectedQuestion = null

      // 1순위: 사용자 관심사와 일치하는 질문
      if (userInterests.length > 0) {
        selectedQuestion = await tx.question.findFirst({
          where: {
            isActive: true,
            category: { in: userInterests }
          },
          orderBy: [
            { totalUsed: 'asc' },  // 덜 사용된 질문 우선
            { id: 'asc' }  // 동일하면 ID 순
          ]
        })
      }

      // 2순위: 관심사 매치 안되면 랜덤 질문
      if (!selectedQuestion) {
        selectedQuestion = await tx.question.findFirst({
          where: { isActive: true },
          orderBy: [
            { totalUsed: 'asc' },
            { id: 'asc' }
          ]
        })
      }
      
      if (!selectedQuestion) {
        // Questions 테이블이 비어있는 경우 - API 레벨에서 자동 복구를 시도해야 함
        throw new Error('사용 가능한 질문이 없습니다. Questions 테이블이 비어있습니다.')
      }
      
      console.log('[SOLO PERSONALIZATION] 질문 추천 완료:', {
        userId,
        soloCompanionId,
        questionId: selectedQuestion.id,
        category: selectedQuestion.category,
        userInterests,
        matchedCategory: userInterests.includes(selectedQuestion.category) ? selectedQuestion.category : null
      })

      // Solo Assignment 생성
      assignment = await tx.assignment.create({
        data: {
          companionId: soloCompanionId,
          serviceDay,
          questionId: selectedQuestion.id,
          status: 'active'
        },
        include: {
          question: true,
          answers: {
            include: {
              user: { select: { nickname: true, label: true } }
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

      // 질문 사용 횟수 증가
      await tx.question.update({
        where: { id: selectedQuestion.id },
        data: { totalUsed: { increment: 1 } }
      })
    }

    return assignment as AssignmentWithDetails | null
  })
}

/**
 * 오늘의 Assignment 조회 또는 생성 (동반자 기반 + Solo 지원)
 */
export async function getOrCreateTodayAssignment(userId: string): Promise<AssignmentWithDetails | null> {
  const serviceDay = getServiceDay()
  
  // 사용자의 동반자 조회
  const companion = await getUserCompanion(userId)
  
  // 동반자이 없으면 Solo Assignment로 처리
  if (!companion) {
    return await getOrCreateSoloAssignment(userId)
  }

  // 트랜잭션으로 Assignment 조회 또는 생성
  return await prisma.$transaction(async (tx) => {
    // 타입 문제 임시 해결을 위한 any 단언
    // 기존 Assignment 확인
    let assignment = await tx.assignment.findFirst({
      where: {
        companionId: companion.id,
        serviceDay,
        status: 'active'
      },
      include: {
        question: true,
        answers: {
          include: {
            user: { select: { nickname: true, label: true } }
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

    // Assignment가 없으면 새로 생성
    if (!assignment) {
      // 관심사 기반 개인화된 질문 추천
      const personalizedResult = await getPersonalizedQuestion(companion.id, [])
      
      if (!personalizedResult) {
        // Questions 테이블이 비어있는 경우 - API 레벨에서 자동 복구를 시도해야 함
        throw new Error('사용 가능한 질문이 없습니다. Questions 테이블이 비어있습니다.')
      }

      const selectedQuestion = personalizedResult.question
      
      console.log('[PERSONALIZATION] 질문 추천 완료:', {
        companionId: companion.id,
        questionId: selectedQuestion.id,
        category: selectedQuestion.category,
        reason: personalizedResult.recommendationReason,
        matchedInterests: personalizedResult.matchedInterests
      })

      // Assignment 생성
      assignment = await tx.assignment.create({
        data: {
          companionId: companion.id,
          serviceDay,
          questionId: selectedQuestion.id,
          status: 'active'
        },
        include: {
          question: true,
          answers: {
            include: {
              user: { select: { nickname: true, label: true } }
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

      // 질문 사용 횟수 증가
      await tx.question.update({
        where: { id: selectedQuestion.id },
        data: { totalUsed: { increment: 1 } }
      })
    }

    return assignment as AssignmentWithDetails | null
  })
}

/**
 * 솔로모드→동반자모드 전환: 공유받은 사용자가 솔로 Assignment에 답변할 때 실행
 */
export async function convertSoloToCompanion(
  assignmentId: string,
  newUserId: string,
  answerContent: string,
  tx: any // PrismaTransaction 타입
): Promise<{
  success: boolean
  gateStatus: GateStatusType
  conversationId?: string
  companionId: string
}> {
  // 1. Solo Assignment 확인
  const assignment = await tx.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      answers: true,
      companion: true,
      question: true
    }
  })

  if (!assignment || !assignment.companionId.startsWith('solo-')) {
    throw new Error('솔로모드 Assignment가 아닙니다.')
  }

  // 2. 원래 사용자 ID 추출
  const originalUserId = assignment.companionId.replace('solo-', '')
  
  // 3. 원래 사용자의 답변이 있는지 확인
  const originalUserAnswer = assignment.answers.find((a: Answer) => a.userId === originalUserId)
  if (!originalUserAnswer) {
    throw new Error('원래 사용자가 아직 답변하지 않았습니다.')
  }

  // 4. 새로운 Companion 생성
  const newCompanion = await tx.companion.create({
    data: {
      user1Id: originalUserId,
      user2Id: newUserId,
      status: 'active',
      connectedAt: new Date()
    }
  })

  console.log('✅ 솔로→동반자 모드 전환: 새 Companion 생성', {
    companionId: newCompanion.id,
    user1Id: originalUserId,
    user2Id: newUserId,
    assignmentId
  })

  // 5. Assignment의 companionId를 새로운 Companion ID로 업데이트
  await tx.assignment.update({
    where: { id: assignmentId },
    data: {
      companionId: newCompanion.id
    }
  })

  // 6. 공유받은 사용자의 답변 생성
  await tx.answer.create({
    data: {
      assignmentId,
      userId: newUserId,
      content: answerContent
    }
  })

  // 7. 이제 2개 답변이 모두 있으므로 Conversation 생성 (게이트 공개)
  const conversation = await tx.conversation.create({
    data: {
      assignmentId,
      isPublic: true
    }
  })

  // 8. Assignment 상태를 completed로 변경
  await tx.assignment.update({
    where: { id: assignmentId },
    data: { status: 'completed' }
  })

  // 9. 기존 Solo Companion 정리 (선택사항)
  const soloCompanionId = `solo-${originalUserId}`
  await tx.companion.updateMany({
    where: { id: soloCompanionId },
    data: { status: 'converted' } // 전환됨을 표시
  })

  console.log('✅ 솔로→동반자 모드 전환 완료', {
    newCompanionId: newCompanion.id,
    conversationId: conversation.id,
    originalUserId,
    newUserId,
    assignmentId
  })

  return {
    success: true,
    gateStatus: 'opened',
    conversationId: conversation.id,
    companionId: newCompanion.id
  }
}

/**
 * 답변 제출 및 게이트 상태 확인 (Solo mode 지원 + 모드 전환)
 */
export async function submitAnswer(
  assignmentId: string, 
  userId: string, 
  content: string,
  isSharedAssignment?: boolean // 공유받은 Assignment인지 여부
): Promise<{ 
  success: boolean
  gateStatus: GateStatusType
  conversationId?: string
  companionId?: string // 새로 생성된 Companion ID (모드 전환 시)
  modeTransition?: boolean // 모드 전환이 일어났는지 여부
}> {
  return await prisma.$transaction(async (tx) => {
    // Assignment 존재 확인 
    const assignment = await tx.assignment.findUnique({
      where: { id: assignmentId },
      include: { 
        answers: true, 
        companion: true,
        question: true,
        conversation: true
      }
    })

    if (!assignment) {
      throw new Error('과제를 찾을 수 없습니다.')
    }

    if (assignment.status !== 'active') {
      throw new Error('이미 완료되었거나 만료된 과제입니다.')
    }

    // Solo Assignment 확인
    const isSolo = assignment.companionId.startsWith('solo-')
    
    // **핵심: 솔로모드→동반자모드 전환 처리**
    if (isSolo && isSharedAssignment) {
      // 공유받은 사용자가 솔로 Assignment에 답변 → 모드 전환
      const result = await convertSoloToCompanion(assignmentId, userId, content, tx)
      return {
        success: result.success,
        gateStatus: result.gateStatus,
        conversationId: result.conversationId,
        companionId: result.companionId,
        modeTransition: true
      }
    }
    
    // **기존 로직: 일반적인 답변 제출**
    if (isSolo) {
      // Solo mode: companionId가 "solo-{userId}" 형태인지 확인
      const expectedSoloCompanionId = `solo-${userId}`
      if (assignment.companionId !== expectedSoloCompanionId) {
        throw new Error('이 과제에 답변할 권한이 없습니다.')
      }
    } else {
      // 동반자 기반: 사용자가 동반자에 속하는지 확인
      if (assignment.companion.user1Id !== userId && assignment.companion.user2Id !== userId) {
        throw new Error('이 과제에 답변할 권한이 없습니다.')
      }
    }

    // 기존 답변 확인 (업데이트 vs 생성)
    const existingAnswer = assignment.answers.find(a => a.userId === userId)

    if (existingAnswer) {
      // 기존 답변 업데이트
      await tx.answer.update({
        where: { id: existingAnswer.id },
        data: { content, updatedAt: new Date() }
      })
    } else {
      // 새 답변 생성
      await tx.answer.create({
        data: {
          assignmentId,
          userId,
          content
        }
      })
    }

    // 현재 답변 수 확인
    const totalAnswers = await tx.answer.count({
      where: { assignmentId }
    })

    // 게이트 상태 결정
    let gateStatus: GateStatusType = 'need_my_answer'
    let conversationId: string | undefined

    if (isSolo) {
      // Solo mode: 답변하면 즉시 solo_mode 상태
      gateStatus = 'solo_mode'
    } else {
      // 동반자 기반 Assignment: 기존 로직
      if (totalAnswers >= 2) {
        // 2개 답변 완료 → Conversation 생성 및 게이트 공개
        let conversation = await tx.conversation.findUnique({
          where: { assignmentId }
        })

        if (!conversation) {
          conversation = await tx.conversation.create({
            data: {
              assignmentId,
              isPublic: true
            }
          })

          // Assignment 상태를 completed로 변경
          await tx.assignment.update({
            where: { id: assignmentId },
            data: { status: 'completed' }
          })
        }

        gateStatus = 'opened'
        conversationId = conversation.id
      } else {
        // 아직 상대방 답변 대기 중
        gateStatus = 'waiting_partner'
      }
    }

    return {
      success: true,
      gateStatus,
      conversationId,
      modeTransition: false
    }
  })
}


/**
 * Assignment가 Solo mode인지 확인
 */
export function isSoloAssignment(assignment: AssignmentWithDetails): boolean {
  return assignment.companionId.startsWith('solo-')
}

/**
 * Assignment의 게이트 상태 계산 (Solo mode 지원)
 */
export function calculateGateStatus(
  assignment: AssignmentWithDetails,
  currentUserId: string
): GateStatusType {
  const totalAnswers = assignment.answers.length
  const myAnswer = assignment.answers.find(a => a.userId === currentUserId)
  const hasConversation = !!assignment.conversation

  // Solo mode 확인
  if (isSoloAssignment(assignment)) {
    return myAnswer ? 'solo_mode' : 'need_my_answer'
  }

  // 동반자 기반 Assignment의 경우 기존 로직
  // 이미 게이트가 열린 경우
  if (hasConversation && totalAnswers >= 2) {
    return 'opened'
  }

  // 내가 답변했는지 확인
  if (myAnswer) {
    // 내가 답변했지만 상대방이 아직 안한 경우
    if (totalAnswers < 2) {
      return 'waiting_partner'
    }
    // 둘 다 답변했지만 아직 게이트가 안열린 경우 (일시적)
    return 'opened'
  } else {
    // 내가 아직 답변 안한 경우
    return 'need_my_answer'
  }
}

/**
 * 특정 Assignment의 상세 정보 조회
 */
export async function getAssignmentWithDetails(
  assignmentId: string,
  userId: string
): Promise<AssignmentWithDetails | null> {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      question: true,
      answers: {
        include: {
          user: { select: { nickname: true, label: true } }
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

  // 권한 확인
  if (assignment && 
      assignment.companion.user1Id !== userId && 
      assignment.companion.user2Id !== userId) {
    return null
  }

  return assignment as AssignmentWithDetails | null
}