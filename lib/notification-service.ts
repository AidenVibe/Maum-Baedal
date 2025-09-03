import { PrismaClient, NotificationType, NotificationStatus } from '@prisma/client'
import { getSolapiClient, SolapiMessage, ALIMTALK_TEMPLATES } from './solapi'
import { getServiceDay } from './service-day'

const prisma = new PrismaClient()

// 알림 시스템 활성화 여부 체크
const NOTIFICATIONS_ENABLED = process.env.ENABLE_NOTIFICATIONS === 'true'

// 알림 시스템 비활성화 시 경고 메시지 (개발 시작 시 한 번만)
if (!NOTIFICATIONS_ENABLED) {
  console.log('[알림 시스템] 비활성화됨 - ENABLE_NOTIFICATIONS=true로 설정하여 활성화 가능')
}

// 알림 발송 데이터 인터페이스
export interface NotificationData {
  userId: string
  type: NotificationType
  variables?: Record<string, string>
  phoneNumber?: string
  scheduledAt?: Date
}

// 템플릿 변수 치환 함수
function replaceVariables(content: string, variables: Record<string, string> = {}): string {
  let result = content
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value)
  })
  
  return result
}

// 사용자 휴대폰 번호 조회 (카카오 프로필에서)
async function getUserPhoneNumber(userId: string): Promise<string | null> {
  // 실제 구현에서는 사용자 설정이나 카카오 프로필에서 휴대폰 번호를 가져와야 함
  const setting = await prisma.notificationSetting.findUnique({
    where: { userId }
  })
  
  return setting?.phoneNumber || null
}

// 개별 알림 발송
export async function sendNotification(data: NotificationData): Promise<boolean> {
  // 알림 시스템이 비활성화된 경우 조기 반환
  if (!NOTIFICATIONS_ENABLED) {
    console.log(`[알림 시스템 비활성화] 알림 발송 건너뜀: ${data.type}`)
    return true // 성공으로 처리하여 핵심 기능에 영향 없도록 함
  }
  
  try {
    console.log(`[알림 발송 시작] 사용자: ${data.userId}, 타입: ${data.type}`)

    // 1. 사용자 알림 설정 확인
    const setting = await prisma.notificationSetting.findUnique({
      where: { userId: data.userId }
    })

    if (!setting?.isActive) {
      console.log(`[알림 건너뛰기] 사용자가 알림을 비활성화함: ${data.userId}`)
      return false
    }

    // 타입별 알림 설정 확인
    const enabledMap = {
      DAILY_QUESTION: setting.enableDailyQuestion,
      ANSWER_REMINDER: setting.enableAnswerReminder,
      GATE_OPENED: setting.enableGateOpened,
      COMPANION_JOINED: setting.enableCompanionJoined,
    }

    if (!enabledMap[data.type]) {
      console.log(`[알림 건너뛰기] ${data.type} 알림이 비활성화됨: ${data.userId}`)
      return false
    }

    // 2. 템플릿 조회
    const template = await prisma.notificationTemplate.findFirst({
      where: { 
        type: data.type,
        isActive: true 
      }
    })

    if (!template) {
      console.error(`[템플릿 없음] ${data.type} 템플릿을 찾을 수 없습니다`)
      return false
    }

    // 3. 휴대폰 번호 확인
    const phoneNumber = data.phoneNumber || await getUserPhoneNumber(data.userId)
    if (!phoneNumber) {
      console.error(`[휴대폰 번호 없음] 사용자: ${data.userId}`)
      return false
    }

    // 4. 템플릿 변수 치환
    const content = replaceVariables(template.content, data.variables)
    const smsContent = replaceVariables(template.smsContent || template.content, data.variables)

    // 5. 발송 로그 생성
    const log = await prisma.notificationLog.create({
      data: {
        templateId: template.id,
        userId: data.userId,
        phoneNumber,
        type: data.type,
        content,
        variables: data.variables || {},
        status: NotificationStatus.PENDING,
      }
    })

    // 6. 솔라피 메시지 구성
    const solapiClient = getSolapiClient()
    const message: SolapiMessage = {
      to: phoneNumber,
      from: process.env.SOLAPI_SENDER_PHONE!,
      text: smsContent, // SMS 대체발송용
      kakaoOptions: {
        pfId: process.env.SOLAPI_KAKAO_CHANNEL!,
        templateId: template.templateId,
        variables: data.variables || {},
      }
    }

    // 7. 솔라피로 발송
    const response = await solapiClient.sendMessage(message)
    
    // 8. 발송 결과 업데이트
    await prisma.notificationLog.update({
      where: { id: log.id },
      data: {
        messageId: response.messageId,
        status: NotificationStatus.SENT,
        solapiResponse: response as any, // JSON 직렬화를 위한 타입 캐스팅
        sentAt: new Date(),
      }
    })

    console.log(`[알림 발송 성공] 메시지ID: ${response.messageId}`)
    return true

  } catch (error: any) {
    console.error(`[알림 발송 실패]`, error)
    
    // 에러 로그 업데이트 (로그가 생성된 경우)
    try {
      await prisma.notificationLog.updateMany({
        where: { 
          userId: data.userId,
          type: data.type,
          status: NotificationStatus.PENDING,
        },
        data: {
          status: NotificationStatus.FAILED,
          errorMessage: error.message,
          failedAt: new Date(),
        }
      })
    } catch (logError) {
      console.error('[로그 업데이트 실패]', logError)
    }

    return false
  }
}

// 그룹 알림 발송 (여러 사용자에게 동일한 알림)
export async function sendGroupNotification(
  userIds: string[],
  type: NotificationType,
  variables?: Record<string, string>
): Promise<{ success: number; failed: number }> {
  // 알림 시스템이 비활성화된 경우 조기 반환
  if (!NOTIFICATIONS_ENABLED) {
    console.log(`[알림 시스템 비활성화] 그룹 알림 건너뜀: ${type}`)
    return { success: userIds.length, failed: 0 } // 모두 성공으로 처리
  }
  
  console.log(`[그룹 알림 시작] ${userIds.length}명, 타입: ${type}`)
  
  let success = 0
  let failed = 0

  // 병렬 처리로 성능 향상
  const promises = userIds.map(async (userId) => {
    try {
      const result = await sendNotification({
        userId,
        type,
        variables
      })
      return result ? 'success' : 'failed'
    } catch (error) {
      console.error(`[그룹 알림 오류] 사용자 ${userId}:`, error)
      return 'failed'
    }
  })

  const results = await Promise.all(promises)
  
  success = results.filter(r => r === 'success').length
  failed = results.filter(r => r === 'failed').length

  console.log(`[그룹 알림 완료] 성공: ${success}, 실패: ${failed}`)
  
  return { success, failed }
}

// 스케줄된 알림 생성
export async function scheduleNotification(data: NotificationData): Promise<string> {
  // 알림 시스템이 비활성화된 경우 더미 ID 반환
  if (!NOTIFICATIONS_ENABLED) {
    console.log(`[알림 시스템 비활성화] 스케줄 알림 건너뜀: ${data.type}`)
    return 'notification-disabled-' + Date.now()
  }
  
  if (!data.scheduledAt) {
    throw new Error('스케줄 시간이 필요합니다')
  }

  const template = await prisma.notificationTemplate.findFirst({
    where: { 
      type: data.type,
      isActive: true 
    }
  })

  if (!template) {
    throw new Error(`${data.type} 템플릿을 찾을 수 없습니다`)
  }

  const scheduled = await prisma.scheduledNotification.create({
    data: {
      userId: data.userId,
      templateId: template.id,
      scheduledAt: data.scheduledAt,
      data: {
        variables: data.variables || {},
        phoneNumber: data.phoneNumber
      }
    }
  })

  console.log(`[알림 스케줄 생성] ID: ${scheduled.id}, 예정: ${data.scheduledAt}`)
  
  return scheduled.id
}

// 일일 질문 알림 발송 (08:00 브로드캐스트)
export async function sendDailyQuestionNotifications(): Promise<{ success: number; failed: number }> {
  // 알림 시스템이 비활성화된 경우 조기 반환
  if (!NOTIFICATIONS_ENABLED) {
    console.log('[알림 시스템 비활성화] 일일 질문 브로드캐스트 건너뜀')
    return { success: 0, failed: 0 }
  }
  
  console.log('[일일 질문 알림] 브로드캐스트 시작')
  
  // 오늘 활성 Assignment가 있는 Companion들 조회
  const serviceDay = getServiceDay()
  const assignments = await prisma.assignment.findMany({
    where: {
      serviceDay,
      status: 'active',
    },
    include: {
      companion: {
        include: {
          user1: true,
          user2: true,
        }
      },
      question: true,
      answers: true,
    }
  })

  const notifications: NotificationData[] = []

  assignments.forEach(assignment => {
    const companion = assignment.companion
    const question = assignment.question
    const answerCount = assignment.answers.length

    // 아직 답변하지 않은 사용자들에게만 발송
    const answeredUserIds = assignment.answers.map(a => a.userId)
    
    const usersToNotify = [
      companion.user1,
      companion.user2
    ].filter(user => 
      user && !answeredUserIds.includes(user.id)
    )

    usersToNotify.forEach(user => {
      if (user) {
        notifications.push({
          userId: user.id,
          type: NotificationType.DAILY_QUESTION,
          variables: {
            nickname: user.nickname || user.name || '회원',
            question: question.content,
            partnerNickname: companion.user1?.id === user.id 
              ? (companion.user2?.nickname || companion.user2?.name || '동반자')
              : (companion.user1?.nickname || companion.user1?.name || '동반자'),
            timeRemaining: '05시까지'
          }
        })
      }
    })
  })

  console.log(`[일일 질문 알림] ${notifications.length}명에게 발송 예정`)

  // 그룹 발송으로 효율적 처리
  const userIds = notifications.map(n => n.userId)
  const commonVariables = notifications[0]?.variables

  return await sendGroupNotification(
    userIds,
    NotificationType.DAILY_QUESTION,
    commonVariables
  )
}

// 답변 리마인드 알림 발송 (19:00)
export async function sendAnswerReminders(): Promise<{ success: number; failed: number }> {
  // 알림 시스템이 비활성화된 경우 조기 반환
  if (!NOTIFICATIONS_ENABLED) {
    console.log('[알림 시스템 비활성화] 답변 리마인드 건너뜀')
    return { success: 0, failed: 0 }
  }
  
  console.log('[답변 리마인드] 알림 시작')
  
  const serviceDay = getServiceDay()
  const assignments = await prisma.assignment.findMany({
    where: {
      serviceDay,
      status: 'active',
    },
    include: {
      companion: {
        include: {
          user1: true,
          user2: true,
        }
      },
      question: true,
      answers: true,
    }
  })

  const notifications: NotificationData[] = []

  assignments.forEach(assignment => {
    const companion = assignment.companion
    const question = assignment.question
    const answerCount = assignment.answers.length

    // 완료된 게이트는 제외
    if (answerCount >= 2) return

    // 아직 답변하지 않은 사용자들 찾기
    const answeredUserIds = assignment.answers.map(a => a.userId)
    
    const usersToNotify = [
      companion.user1,
      companion.user2
    ].filter(user => 
      user && !answeredUserIds.includes(user.id)
    )

    usersToNotify.forEach(user => {
      if (user) {
        notifications.push({
          userId: user.id,
          type: NotificationType.ANSWER_REMINDER,
          variables: {
            nickname: user.nickname || user.name || '회원',
            question: question.content,
            partnerNickname: companion.user1?.id === user.id 
              ? (companion.user2?.nickname || companion.user2?.name || '동반자')
              : (companion.user1?.nickname || companion.user1?.name || '동반자'),
            timeRemaining: '몇 시간'
          }
        })
      }
    })
  })

  console.log(`[답변 리마인드] ${notifications.length}명에게 발송 예정`)

  if (notifications.length === 0) {
    return { success: 0, failed: 0 }
  }

  const userIds = notifications.map(n => n.userId)
  
  return await sendGroupNotification(
    userIds,
    NotificationType.ANSWER_REMINDER
  )
}

// 게이트 공개 알림 (답변 2개 완료 시 즉시)
export async function sendGateOpenedNotification(assignmentId: string): Promise<boolean> {
  // 알림 시스템이 비활성화된 경우 조기 반환
  if (!NOTIFICATIONS_ENABLED) {
    console.log('[알림 시스템 비활성화] 게이트 공개 알림 건너뜀')
    return true // 성공으로 처리하여 핵심 기능에 영향 없도록 함
  }
  
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        companion: {
          include: {
            user1: true,
            user2: true,
          }
        },
        question: true,
        answers: {
          include: { user: true }
        }
      }
    })

    if (!assignment || assignment.answers.length < 2) {
      return false
    }

    const users = [assignment.companion.user1, assignment.companion.user2]
      .filter(user => user !== null)

    const notifications = users.map(user => ({
      userId: user!.id,
      type: NotificationType.GATE_OPENED,
      variables: {
        nickname: user!.nickname || user!.name || '회원',
        question: assignment.question.content,
        partnerNickname: users.find(u => u!.id !== user!.id)?.nickname || '동반자'
      }
    }))

    const results = await Promise.all(
      notifications.map(notification => sendNotification(notification))
    )

    const successCount = results.filter(r => r).length
    console.log(`[게이트 공개 알림] ${successCount}/${notifications.length}명 발송 성공`)

    return successCount > 0

  } catch (error) {
    console.error('[게이트 공개 알림 실패]', error)
    return false
  }
}