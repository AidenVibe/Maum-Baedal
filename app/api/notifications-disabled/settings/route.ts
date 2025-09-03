import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/notifications/settings - 사용자 알림 설정 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ 
        error: '로그인이 필요합니다' 
      }, { status: 401 })
    }

    const setting = await prisma.notificationSetting.findUnique({
      where: { userId: session.user.id }
    })

    if (!setting) {
      // 기본 설정 생성
      const newSetting = await prisma.notificationSetting.create({
        data: {
          userId: session.user.id,
          enableDailyQuestion: true,
          enableAnswerReminder: true,
          enableGateOpened: true,
          enableCompanionJoined: true,
          reminderTime: '19:00',
          isActive: true,
        }
      })

      return NextResponse.json({
        settings: newSetting
      })
    }

    return NextResponse.json({
      settings: setting
    })

  } catch (error: any) {
    console.error('알림 설정 조회 오류:', error)
    return NextResponse.json({ 
      error: '설정 조회에 실패했습니다' 
    }, { status: 500 })
  }
}

// PATCH /api/notifications/settings - 사용자 알림 설정 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ 
        error: '로그인이 필요합니다' 
      }, { status: 401 })
    }

    const body = await request.json()
    const {
      phoneNumber,
      enableDailyQuestion,
      enableAnswerReminder,
      enableGateOpened,
      enableCompanionJoined,
      reminderTime,
      isActive
    } = body

    // 휴대폰 번호 검증 (선택적)
    if (phoneNumber && !/^01[0-9]{8,9}$/.test(phoneNumber.replace(/-/g, ''))) {
      return NextResponse.json({ 
        error: '유효하지 않은 휴대폰 번호입니다' 
      }, { status: 400 })
    }

    // 리마인드 시간 검증 (HH:MM 형식)
    if (reminderTime && !/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(reminderTime)) {
      return NextResponse.json({ 
        error: '유효하지 않은 시간 형식입니다 (HH:MM)' 
      }, { status: 400 })
    }

    const updatedSetting = await prisma.notificationSetting.upsert({
      where: { userId: session.user.id },
      update: {
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(enableDailyQuestion !== undefined && { enableDailyQuestion }),
        ...(enableAnswerReminder !== undefined && { enableAnswerReminder }),
        ...(enableGateOpened !== undefined && { enableGateOpened }),
        ...(enableCompanionJoined !== undefined && { enableCompanionJoined }),
        ...(reminderTime !== undefined && { reminderTime }),
        ...(isActive !== undefined && { isActive }),
      },
      create: {
        userId: session.user.id,
        phoneNumber,
        enableDailyQuestion: enableDailyQuestion ?? true,
        enableAnswerReminder: enableAnswerReminder ?? true,
        enableGateOpened: enableGateOpened ?? true,
        enableCompanionJoined: enableCompanionJoined ?? true,
        reminderTime: reminderTime ?? '19:00',
        isActive: isActive ?? true,
      }
    })

    return NextResponse.json({
      success: true,
      settings: updatedSetting,
      message: '알림 설정이 업데이트되었습니다'
    })

  } catch (error: any) {
    console.error('알림 설정 업데이트 오류:', error)
    return NextResponse.json({ 
      error: '설정 업데이트에 실패했습니다' 
    }, { status: 500 })
  }
}

// POST /api/notifications/settings - 알림 테스트 발송
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ 
        error: '로그인이 필요합니다' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { testType = 'daily_question' } = body

    // 테스트 알림 발송
    const { sendNotification } = await import('@/lib/notification-service')
    const { NotificationType } = await import('@prisma/client')

    const typeMap = {
      daily_question: NotificationType.DAILY_QUESTION,
      answer_reminder: NotificationType.ANSWER_REMINDER,
      gate_opened: NotificationType.GATE_OPENED,
      companion_joined: NotificationType.COMPANION_JOINED,
    }

    if (!typeMap[testType as keyof typeof typeMap]) {
      return NextResponse.json({ 
        error: '유효하지 않은 테스트 타입입니다' 
      }, { status: 400 })
    }

    const success = await sendNotification({
      userId: session.user.id,
      type: typeMap[testType as keyof typeof typeMap],
      variables: {
        nickname: session.user.nickname || session.user.name || '회원',
        question: '이것은 테스트 질문입니다',
        partnerNickname: '동반자',
        timeRemaining: '테스트'
      }
    })

    if (success) {
      return NextResponse.json({
        success: true,
        message: '테스트 알림이 발송되었습니다'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: '테스트 알림 발송에 실패했습니다'
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('테스트 알림 발송 오류:', error)
    return NextResponse.json({ 
      error: '테스트 알림 발송에 실패했습니다',
      details: error.message 
    }, { status: 500 })
  }
}