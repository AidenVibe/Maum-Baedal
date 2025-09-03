import { NextRequest, NextResponse } from 'next/server'
import { sendAnswerReminders } from '@/lib/notification-service'

// GET /api/cron/reminder-broadcast - 매일 19:00 (KST 기준 10:00 UTC) 실행
export async function GET(request: NextRequest) {
  try {
    // Vercel Cron 보안 검증
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    console.log('[크론잡] 리마인드 브로드캐스트 시작:', new Date().toISOString())

    // 답변 리마인드 브로드캐스트 실행
    const result = await sendAnswerReminders()

    // 발송 대상이 없는 경우 (모든 게이트가 완료된 경우)
    if (result.success === 0 && result.failed === 0) {
      console.log('[크론잡] 리마인드 발송 대상이 없습니다')
      return NextResponse.json({
        success: true,
        message: '리마인드 발송 대상이 없습니다 (모든 게이트 완료)',
        result: {
          총발송대상: 0,
          발송성공: 0,
          발송실패: 0,
          성공률: 100
        },
        timestamp: new Date().toISOString()
      })
    }

    // 결과 로깅
    const logData = {
      timestamp: new Date().toISOString(),
      type: 'reminder_broadcast',
      result: {
        총발송대상: result.success + result.failed,
        발송성공: result.success,
        발송실패: result.failed,
        성공률: result.success + result.failed > 0 
          ? Math.round((result.success / (result.success + result.failed)) * 100)
          : 0
      }
    }

    console.log('[크론잡] 리마인드 브로드캐스트 완료:', logData)

    return NextResponse.json({
      success: true,
      message: '리마인드 브로드캐스트가 성공적으로 완료되었습니다',
      ...logData
    })

  } catch (error: any) {
    console.error('[크론잡] 리마인드 브로드캐스트 실패:', error)

    return NextResponse.json({ 
      success: false,
      error: '리마인드 브로드캐스트 실행 중 오류가 발생했습니다',
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

    console.log('[수동 실행] 리마인드 브로드캐스트 시작:', new Date().toISOString())

    const result = await sendAnswerReminders()

    // 발송 대상이 없는 경우
    if (result.success === 0 && result.failed === 0) {
      return NextResponse.json({
        success: true,
        message: '리마인드 발송 대상이 없습니다',
        result: {
          총발송대상: 0,
          발송성공: 0,
          발송실패: 0,
          성공률: 100
        },
        timestamp: new Date().toISOString()
      })
    }

    const logData = {
      timestamp: new Date().toISOString(),
      type: 'reminder_broadcast_manual',
      result: {
        총발송대상: result.success + result.failed,
        발송성공: result.success,
        발송실패: result.failed,
        성공률: result.success + result.failed > 0 
          ? Math.round((result.success / (result.success + result.failed)) * 100)
          : 0
      }
    }

    console.log('[수동 실행] 리마인드 브로드캐스트 완료:', logData)

    return NextResponse.json({
      success: true,
      message: '리마인드 브로드캐스트가 수동으로 실행되었습니다',
      ...logData
    })

  } catch (error: any) {
    console.error('[수동 실행] 리마인드 브로드캐스트 실패:', error)
    
    return NextResponse.json({ 
      success: false,
      error: '수동 리마인드 브로드캐스트 실행 중 오류가 발생했습니다',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}