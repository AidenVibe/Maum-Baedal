import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendNotification, NotificationData } from '@/lib/notification-service'
import { NotificationType } from '@prisma/client'

// POST /api/notifications/send - 개별 알림 발송
export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const adminSecret = request.headers.get('X-Admin-Secret')
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ 
        error: '관리자 권한이 필요합니다' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { userId, type, variables, phoneNumber } = body

    // 입력값 검증
    if (!userId || !type) {
      return NextResponse.json({ 
        error: 'userId와 type은 필수입니다' 
      }, { status: 400 })
    }

    if (!Object.values(NotificationType).includes(type)) {
      return NextResponse.json({ 
        error: '유효하지 않은 알림 타입입니다' 
      }, { status: 400 })
    }

    const notificationData: NotificationData = {
      userId,
      type,
      variables,
      phoneNumber
    }

    const success = await sendNotification(notificationData)

    if (success) {
      return NextResponse.json({ 
        success: true,
        message: '알림이 성공적으로 발송되었습니다' 
      })
    } else {
      return NextResponse.json({ 
        success: false,
        message: '알림 발송에 실패했습니다' 
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('알림 발송 API 오류:', error)
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다',
      details: error.message 
    }, { status: 500 })
  }
}

// GET /api/notifications/send - API 사용법 안내
export async function GET() {
  return NextResponse.json({
    message: 'Notification Send API',
    usage: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Secret': 'your-admin-secret'
      },
      body: {
        userId: 'string (required)',
        type: 'DAILY_QUESTION | ANSWER_REMINDER | GATE_OPENED | COMPANION_JOINED (required)',
        variables: 'object (optional)',
        phoneNumber: 'string (optional)'
      }
    },
    example: {
      userId: 'clxyz123',
      type: 'DAILY_QUESTION',
      variables: {
        nickname: '철수',
        question: '오늘 가장 행복했던 순간은?',
        partnerNickname: '영희'
      }
    }
  })
}