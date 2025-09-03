import { NextRequest, NextResponse } from 'next/server'
import { sendDailyQuestionNotifications } from '@/lib/notification-service'

// GET /api/cron/daily-broadcast - 매일 08:00 (KST 기준 23:00 UTC) 실행
export async function GET(request: NextRequest) {
  try {
    // Vercel Cron 보안 검증
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    console.log('[크론잡] 일일 브로드캐스트 시작:', new Date().toISOString())

    // 일일 질문 브로드캐스트 실행
    const result = await sendDailyQuestionNotifications()

    // 결과 로깅
    const logData = {
      timestamp: new Date().toISOString(),
      type: 'daily_broadcast',
      result: {
        총발송대상: result.success + result.failed,
        발송성공: result.success,
        발송실패: result.failed,
        성공률: result.success + result.failed > 0 
          ? Math.round((result.success / (result.success + result.failed)) * 100)
          : 0
      }
    }

    console.log('[크론잡] 일일 브로드캐스트 완료:', logData)

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '일일 브로드캐스트가 성공적으로 완료되었습니다',
      ...logData
    })

  } catch (error: any) {
    console.error('[크론잡] 일일 브로드캐스트 실패:', error)

    // Slack/Discord 등으로 알림 발송 (선택사항)
    // await sendErrorAlert('daily_broadcast', error.message)

    return NextResponse.json({ 
      success: false,
      error: '일일 브로드캐스트 실행 중 오류가 발생했습니다',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// POST 요청도 지원 (수동 실행용)
export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const adminSecret = request.headers.get('X-Admin-Secret')
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ 
        error: '관리자 권한이 필요합니다' 
      }, { status: 403 })
    }

    console.log('[수동 실행] 일일 브로드캐스트 시작:', new Date().toISOString())

    const result = await sendDailyQuestionNotifications()

    const logData = {
      timestamp: new Date().toISOString(),
      type: 'daily_broadcast_manual',
      result: {
        총발송대상: result.success + result.failed,
        발송성공: result.success,
        발송실패: result.failed,
        성공률: result.success + result.failed > 0 
          ? Math.round((result.success / (result.success + result.failed)) * 100)
          : 0
      }
    }

    console.log('[수동 실행] 일일 브로드캐스트 완료:', logData)

    return NextResponse.json({
      success: true,
      message: '일일 브로드캐스트가 수동으로 실행되었습니다',
      ...logData
    })

  } catch (error: any) {
    console.error('[수동 실행] 일일 브로드캐스트 실패:', error)
    
    return NextResponse.json({ 
      success: false,
      error: '수동 브로드캐스트 실행 중 오류가 발생했습니다',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}