import { NextRequest, NextResponse } from 'next/server'
import { 
  sendDailyQuestionNotifications, 
  sendAnswerReminders 
} from '@/lib/notification-service'

// POST /api/notifications/broadcast - 브로드캐스트 알림 발송
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
    const { type } = body

    let result = { success: 0, failed: 0 }

    switch (type) {
      case 'daily_question':
        console.log('[브로드캐스트] 일일 질문 알림 시작')
        result = await sendDailyQuestionNotifications()
        break

      case 'answer_reminder':
        console.log('[브로드캐스트] 답변 리마인드 시작')
        result = await sendAnswerReminders()
        break

      default:
        return NextResponse.json({ 
          error: '유효하지 않은 브로드캐스트 타입입니다. daily_question 또는 answer_reminder를 사용하세요.' 
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      type,
      result: {
        총발송대상: result.success + result.failed,
        발송성공: result.success,
        발송실패: result.failed,
        성공률: result.success + result.failed > 0 
          ? `${Math.round((result.success / (result.success + result.failed)) * 100)}%`
          : '0%'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('브로드캐스트 API 오류:', error)
    return NextResponse.json({ 
      error: '브로드캐스트 발송에 실패했습니다',
      details: error.message 
    }, { status: 500 })
  }
}

// GET /api/notifications/broadcast - 브로드캐스트 대상 조회
export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const adminSecret = request.headers.get('X-Admin-Secret')
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ 
        error: '관리자 권한이 필요합니다' 
      }, { status: 403 })
    }

    const { searchParams } = request.nextUrl
    const type = searchParams.get('type') || 'daily_question'

    // 브로드캐스트 대상자 조회 로직
    const { PrismaClient } = await import('@prisma/client')
    const { getServiceDay } = await import('@/lib/service-day')
    
    const prisma = new PrismaClient()
    const serviceDay = getServiceDay()

    try {
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

      let targets: any[] = []

      if (type === 'daily_question') {
        // 아직 답변하지 않은 사용자들
        assignments.forEach(assignment => {
          const answeredUserIds = assignment.answers.map(a => a.userId)
          const users = [assignment.companion.user1, assignment.companion.user2]
            .filter(user => user && !answeredUserIds.includes(user.id))

          users.forEach(user => {
            if (user) {
              targets.push({
                userId: user.id,
                nickname: user.nickname || user.name,
                assignmentId: assignment.id,
                question: assignment.question.content,
                status: '미답변'
              })
            }
          })
        })
      } else if (type === 'answer_reminder') {
        // 미완료 게이트 사용자들
        const incompleteAssignments = assignments.filter(a => a.answers.length < 2)
        
        incompleteAssignments.forEach(assignment => {
          const answeredUserIds = assignment.answers.map(a => a.userId)
          const users = [assignment.companion.user1, assignment.companion.user2]
            .filter(user => user && !answeredUserIds.includes(user.id))

          users.forEach(user => {
            if (user) {
              targets.push({
                userId: user.id,
                nickname: user.nickname || user.name,
                assignmentId: assignment.id,
                question: assignment.question.content,
                status: '리마인드 필요',
                answerCount: assignment.answers.length
              })
            }
          })
        })
      }

      return NextResponse.json({
        type,
        serviceDay,
        totalTargets: targets.length,
        targets: targets.slice(0, 50), // 최대 50개만 미리보기
        hasMore: targets.length > 50,
        timestamp: new Date().toISOString()
      })

    } finally {
      await prisma.$disconnect()
    }

  } catch (error: any) {
    console.error('브로드캐스트 대상 조회 오류:', error)
    return NextResponse.json({ 
      error: '브로드캐스트 대상 조회에 실패했습니다',
      details: error.message 
    }, { status: 500 })
  }
}